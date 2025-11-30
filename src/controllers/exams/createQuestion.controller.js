import Media from "#models/media.model.js";
import Question from "#models/question.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { QUESTION_TYPE } from "#utils/constants/model.constant.js";
import { validateImageDimensions } from "#validations/rules.js";

export const createQuestion = ApiHandler(async (req, res) => {
  // Parsing request
  const exam_id = req.body.exam_id?.trim();
  const question_text = req.body.question_text?.trim();
  const type = req.body.type?.trim();
  const question_image = req.files?.question_image?.[0] || req.file; // Support both single file and array
  const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};

  // Validate question type
  if (!type || !Object.values(QUESTION_TYPE).includes(type)) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      `Question type must be one of: ${Object.values(QUESTION_TYPE).join(", ")}`
    );
  }

  // Handle question image upload
  let question_image_id = null;
  if (question_image) {
    try {
      // Validate image dimensions (max 1920x1080)
      await validateImageDimensions(question_image.buffer, 1920, 1080);

      const questionMedia = await Media.create({
        media: question_image.buffer,
      });
      question_image_id = questionMedia.id;
    } catch (error) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        error.message || "Invalid question image"
      );
    }
  }

  // Handle option images for MCQ questions
  const option_images = req.files?.option_images || [];
  if (
    type === QUESTION_TYPE.MCQ_SINGLE ||
    type === QUESTION_TYPE.MCQ_MULTIPLE
  ) {
    // Process options and handle images
    if (metadata.options && Array.isArray(metadata.options)) {
      let imageIndex = 0; // Track current position in option_images array

      for (let i = 0; i < metadata.options.length; i++) {
        const option = metadata.options[i];

        // Check if this option has an image_id placeholder (meaning it should have an image)
        const hasImagePlaceholder =
          option.image_id === "placeholder" || option.image_id;
        const optionImage =
          hasImagePlaceholder && imageIndex < option_images.length
            ? option_images[imageIndex]
            : null;

        // Validate: option must have either text or image, not both, not neither
        if (optionImage && option.text && option.text.trim().length > 0) {
          throw new ApiError(
            400,
            "BAD_REQUEST",
            `Option ${i + 1} cannot have both text and image. Please provide either text or image.`
          );
        }

        if (
          !optionImage &&
          (!option.text || option.text.trim().length === 0) &&
          !hasImagePlaceholder
        ) {
          throw new ApiError(
            400,
            "BAD_REQUEST",
            `Option ${i + 1} must have either text or image.`
          );
        }

        // If option has image, upload and store media_id
        if (optionImage) {
          try {
            // Validate image dimensions (max 1920x1080)
            await validateImageDimensions(optionImage.buffer, 1920, 1080);

            const optionMedia = await Media.create({
              media: optionImage.buffer,
            });
            // Replace placeholder with actual image_id in metadata
            metadata.options[i] = { image_id: optionMedia.id };
            imageIndex++; // Move to next image in array
          } catch (error) {
            throw new ApiError(
              400,
              "BAD_REQUEST",
              `Invalid image for option ${i + 1}: ${error.message}`
            );
          }
        } else if (hasImagePlaceholder && !optionImage) {
          throw new ApiError(
            400,
            "BAD_REQUEST",
            `Option ${i + 1} is marked as having an image but no image file was provided.`
          );
        }
      }
    }
  }

  // Validate metadata based on question type
  if (type === QUESTION_TYPE.MCQ_SINGLE) {
    if (
      !metadata?.options ||
      !Array.isArray(metadata.options) ||
      metadata.options.length < 2
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "MCQ_SINGLE questions must have at least 2 options"
      );
    }
    if (
      !Array.isArray(metadata.correct_answers) ||
      metadata.correct_answers.length !== 1
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "MCQ_SINGLE questions must have exactly one correct answer index"
      );
    }
    // Validate that the correct answer index is valid
    if (
      metadata.correct_answers[0] < 0 ||
      metadata.correct_answers[0] >= metadata.options.length
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "Correct answer index is out of range"
      );
    }
  } else if (type === QUESTION_TYPE.MCQ_MULTIPLE) {
    if (
      !metadata?.options ||
      !Array.isArray(metadata.options) ||
      metadata.options.length < 2
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "MCQ_MULTIPLE questions must have at least 2 options"
      );
    }
    if (
      !Array.isArray(metadata.correct_answers) ||
      metadata.correct_answers.length < 1
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "MCQ_MULTIPLE questions must have at least one correct answer index"
      );
    }
    // Validate that all correct answer indices are valid
    const invalidIndices = metadata.correct_answers.filter(
      (index) => index < 0 || index >= metadata.options.length
    );
    if (invalidIndices.length > 0) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "One or more correct answer indices are out of range"
      );
    }
  } else if (type === QUESTION_TYPE.SINGLE_WORD) {
    if (
      !metadata?.correct_answer ||
      typeof metadata.correct_answer !== "string" ||
      metadata.correct_answer.trim().length === 0
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "SINGLE_WORD questions must have a correct_answer string"
      );
    }
  }

  // Create question
  const question = await Question.create({
    exam_id,
    question_text,
    question_image_id,
    type,
    metadata,
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("QUESTION_CREATED", {
      id: question.id,
    })
  );
});
