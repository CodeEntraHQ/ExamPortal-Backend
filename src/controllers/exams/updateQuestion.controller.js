import Media from "#models/media.model.js";
import Question from "#models/question.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { QUESTION_TYPE } from "#utils/constants/model.constant.js";
import { validateImageDimensions } from "#validations/rules.js";

export const updateQuestion = ApiHandler(async (req, res) => {
  // Parsing request
  const question_id = req.params.id?.trim();
  const question_text = req.body.question_text?.trim();
  const type = req.body.type?.trim();
  const question_image = req.files?.question_image?.[0] || req.file;
  const metadata = req.body.metadata
    ? JSON.parse(req.body.metadata)
    : undefined;

  // Validate question_id
  if (!question_id) {
    throw new ApiError(400, "BAD_REQUEST", "question_id is required");
  }

  // Find question
  const question = await Question.findByPk(question_id);

  if (!question) {
    throw new ApiError(404, "QUESTION_NOT_FOUND", "Question not found");
  }

  // Handle question image upload
  if (question_image) {
    try {
      // Validate image dimensions (max 1920x1080)
      await validateImageDimensions(question_image.buffer, 1920, 1080);

      // Delete old image if exists
      if (question.question_image_id) {
        await Media.destroy({ where: { id: question.question_image_id } });
      }

      const questionMedia = await Media.create({
        media: question_image.buffer,
      });
      updateData.question_image_id = questionMedia.id;
    } catch (error) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        error.message || "Invalid question image"
      );
    }
  }

  // Build update data
  const updateData = {};
  if (question_text !== undefined) updateData.question_text = question_text;
  if (type !== undefined) {
    // Validate question type
    if (!Object.values(QUESTION_TYPE).includes(type)) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        `Question type must be one of: ${Object.values(QUESTION_TYPE).join(", ")}`
      );
    }
    updateData.type = type;
  }

  // Handle option images for MCQ questions if metadata is provided
  const option_images = req.files?.option_images || [];
  if (
    metadata !== undefined &&
    (type || question.type) &&
    ((type || question.type) === QUESTION_TYPE.MCQ_SINGLE ||
      (type || question.type) === QUESTION_TYPE.MCQ_MULTIPLE)
  ) {
    // Process options and handle images
    if (metadata.options && Array.isArray(metadata.options)) {
      const processedMetadata = { ...metadata };
      let imageIndex = 0; // Track current position in option_images array

      for (let i = 0; i < metadata.options.length; i++) {
        const option = metadata.options[i];

        // Check if this option has an image_id placeholder (meaning it should have an image)
        const hasImagePlaceholder =
          option.image_id === "placeholder" ||
          (option.image_id && !question.metadata?.options?.[i]?.image_id);
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
          !option.image_id &&
          !hasImagePlaceholder
        ) {
          throw new ApiError(
            400,
            "BAD_REQUEST",
            `Option ${i + 1} must have either text or image.`
          );
        }

        // If option has new image, upload and store media_id
        if (optionImage) {
          try {
            // Validate image dimensions (max 1920x1080)
            await validateImageDimensions(optionImage.buffer, 1920, 1080);

            // Delete old image if exists
            if (option.image_id && option.image_id !== "placeholder") {
              await Media.destroy({ where: { id: option.image_id } });
            }

            const optionMedia = await Media.create({
              media: optionImage.buffer,
            });
            // Replace placeholder with actual image_id in metadata
            processedMetadata.options[i] = { image_id: optionMedia.id };
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

      updateData.metadata = processedMetadata;
    } else {
      updateData.metadata = metadata;
    }
  } else if (metadata !== undefined) {
    updateData.metadata = metadata;
  }

  // Validate required fields
  const updatedQuestionText =
    updateData.question_text || question.question_text;
  const updatedType = updateData.type || question.type;

  if (!updatedQuestionText || !updatedType) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "question_text and type cannot be empty"
    );
  }

  // Validate metadata based on question type (use updated type if provided, otherwise existing type)
  const typeToValidate = updateData.type || question.type;
  const metadataToValidate =
    updateData.metadata !== undefined ? updateData.metadata : question.metadata;

  if (typeToValidate === QUESTION_TYPE.MCQ_SINGLE) {
    if (
      !metadataToValidate?.options ||
      !Array.isArray(metadataToValidate.options) ||
      metadataToValidate.options.length < 2
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "MCQ_SINGLE questions must have at least 2 options"
      );
    }
    if (
      !Array.isArray(metadataToValidate.correct_answers) ||
      metadataToValidate.correct_answers.length !== 1
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "MCQ_SINGLE questions must have exactly one correct answer index"
      );
    }
    // Validate that the correct answer index is valid
    if (
      metadataToValidate.correct_answers[0] < 0 ||
      metadataToValidate.correct_answers[0] >= metadataToValidate.options.length
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "Correct answer index is out of range"
      );
    }
  } else if (typeToValidate === QUESTION_TYPE.MCQ_MULTIPLE) {
    if (
      !metadataToValidate?.options ||
      !Array.isArray(metadataToValidate.options) ||
      metadataToValidate.options.length < 2
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "MCQ_MULTIPLE questions must have at least 2 options"
      );
    }
    if (
      !Array.isArray(metadataToValidate.correct_answers) ||
      metadataToValidate.correct_answers.length < 1
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "MCQ_MULTIPLE questions must have at least one correct answer index"
      );
    }
    // Validate that all correct answer indices are valid
    const invalidIndices = metadataToValidate.correct_answers.filter(
      (index) => index < 0 || index >= metadataToValidate.options.length
    );
    if (invalidIndices.length > 0) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "One or more correct answer indices are out of range"
      );
    }
  } else if (typeToValidate === QUESTION_TYPE.SINGLE_WORD) {
    if (
      !metadataToValidate?.correct_answer ||
      typeof metadataToValidate.correct_answer !== "string" ||
      metadataToValidate.correct_answer.trim().length === 0
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "SINGLE_WORD questions must have a correct_answer string"
      );
    }
  }

  // Update question
  await question.update(updateData);

  // Refresh question to get updated data
  await question.reload();

  // Send response
  return res.status(200).json(
    new ApiResponse("QUESTION_UPDATED", {
      id: question.id,
      question_text: question.question_text,
      type: question.type,
      metadata: question.metadata,
      created_at: question.created_at,
    })
  );
});
