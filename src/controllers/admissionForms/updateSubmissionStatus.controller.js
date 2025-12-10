import bcrypt from "bcrypt";

import AdmissionFormSubmission from "#models/admissionFormSubmission.model.js";
import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import Result from "#models/result.model.js";
import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import {
  ENROLLMENT_STATUS,
  SUBMISSION_STATUS,
  USER_ROLES,
  USER_STATUS,
} from "#utils/constants/model.constant.js";
import { getUserInvitationLink } from "#utils/crypto.util.js";
import { sendStudentApprovalEmail } from "#utils/email-handler/triggerEmail.js";
import { generateUUID } from "#utils/utils.js";

export const updateSubmissionStatus = ApiHandler(async (req, res) => {
  const { submission_id } = req.params;
  const { action, password } = req.body; // 'approve' or 'reject', password for approve

  // Validate action
  if (!["approve", "reject"].includes(action)) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "Action must be 'approve' or 'reject'"
    );
  }

  // Check authorization - only ADMIN and SUPERADMIN can approve/reject
  if (![USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN].includes(req.user.role)) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Only admins can approve or reject submissions"
    );
  }

  // Find submission
  const submission = await AdmissionFormSubmission.findByPk(submission_id);

  if (!submission) {
    throw new ApiError(404, "NOT_FOUND", "Submission not found");
  }

  // Check if submission is already processed
  if (submission.status !== SUBMISSION_STATUS.PENDING) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      `Submission is already ${submission.status}`
    );
  }

  // Get exam to check entity_id
  const exam = await Exam.findByPk(submission.exam_id);
  if (!exam) {
    throw new ApiError(404, "NOT_FOUND", "Exam not found");
  }

  // Determine entity_id based on user role
  let targetEntityId = exam.entity_id;
  if (req.user.role === "ADMIN") {
    // ADMIN can only manage submissions for their own entity
    if (exam.entity_id !== req.user.entity_id) {
      throw new ApiError(
        403,
        "FORBIDDEN",
        "You can only manage submissions for your own entity"
      );
    }
    targetEntityId = req.user.entity_id;
  } else if (req.user.role === "SUPERADMIN") {
    // SUPERADMIN can manage any submission
    targetEntityId = exam.entity_id;
  }

  if (action === "reject") {
    // Simply update status to REJECTED
    await submission.update({
      status: SUBMISSION_STATUS.REJECTED,
    });

    return res.status(200).json(
      new ApiResponse("SUBMISSION_REJECTED", {
        id: submission.id,
        status: submission.status,
      })
    );
  }

  // Action is 'approve'
  // Extract user data from form_responses
  const formResponses = submission.form_responses || {};

  // Try to find email, name, phone_number, address, gender, roll_number from form_responses
  // The keys might vary, so we'll search for common patterns
  let email = null;
  let name = null;
  let phone_number = null;
  let address = null;
  let gender = null;
  let roll_number = null;

  // Search for email (case-insensitive)
  for (const [key, value] of Object.entries(formResponses)) {
    const lowerKey = key.toLowerCase();
    if (
      (lowerKey.includes("email") || lowerKey === "email") &&
      typeof value === "string" &&
      value.includes("@")
    ) {
      email = value.trim();
    } else if (
      (lowerKey.includes("name") ||
        lowerKey === "name" ||
        lowerKey === "full name") &&
      typeof value === "string"
    ) {
      name = value.trim();
    } else if (
      (lowerKey.includes("phone") ||
        lowerKey.includes("mobile") ||
        lowerKey === "phone") &&
      typeof value === "string"
    ) {
      phone_number = String(value)
        .replace(/[\s\-()]/g, "")
        .trim();
    } else if (
      (lowerKey.includes("address") || lowerKey === "address") &&
      typeof value === "string"
    ) {
      address = value.trim();
    } else if (
      (lowerKey.includes("gender") || lowerKey === "gender") &&
      typeof value === "string"
    ) {
      const genderValue = value.trim().toUpperCase();
      if (["MALE", "FEMALE"].includes(genderValue)) {
        gender = genderValue;
      }
    } else if (
      (lowerKey.includes("roll") ||
        lowerKey.includes("roll number") ||
        lowerKey === "roll_number") &&
      typeof value === "string"
    ) {
      roll_number = value.trim();
    }
  }

  // Email is required for creating user account
  if (!email) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "Email not found in form responses. Cannot create user account."
    );
  }

  // Check submission origin
  const isFromRepresentative = submission.representative_id !== null;
  const isFromPublicLink = submission.representative_id === null;

  // Check if user already exists
  let user = await User.findOne({
    where: { email: email },
  });

  if (user) {
    // User exists - check if they're in the same entity
    if (user.entity_id !== targetEntityId) {
      throw new ApiError(
        409,
        "CONFLICT",
        "User with this email already exists in a different entity"
      );
    }

    // Handle user status and updates
    const updateData = {
      name: name || user.name,
      phone_number: phone_number || user.phone_number,
      address: address || user.address,
      gender: gender || user.gender,
      roll_number: roll_number || user.roll_number,
    };

    // If from representative/public and user doesn't have password, set status to ACTIVATION_PENDING
    // so they can use the registration endpoint
    if ((isFromRepresentative || isFromPublicLink) && !user.password_hash) {
      updateData.status = USER_STATUS.ACTIVATION_PENDING;
    } else if (user.status !== USER_STATUS.ACTIVE) {
      // Otherwise, activate inactive/pending users
      updateData.status = USER_STATUS.ACTIVE;
    }

    await user.update(updateData);

    // If from representative or public link, notify student (password setup only when needed)
    if (isFromRepresentative || isFromPublicLink) {
      if (!user.password_hash) {
        const passwordSetupLink = getUserInvitationLink(user.id);
        const emailSent = await sendStudentApprovalEmail(
          user.email,
          user.name || name,
          passwordSetupLink,
          {
            title: exam.title,
            description: exam.description,
            start_time: exam.start_time,
          }
        );
        if (!emailSent) {
          console.error("Failed to send student approval email");
        }
      }
    }
  } else {
    // Create new user account
    const user_id = generateUUID();

    // If from representative or public, create user without password
    // Otherwise, use provided password
    let password_hash = null;
    let userStatus = USER_STATUS.ACTIVE;

    if (!isFromRepresentative && !isFromPublicLink && password) {
      password_hash = await bcrypt.hash(password, 10);
    } else if (isFromRepresentative || isFromPublicLink) {
      // User needs to set password, so set status to ACTIVATION_PENDING
      // This allows them to use the registration endpoint
      userStatus = USER_STATUS.ACTIVATION_PENDING;
    }

    user = await User.create({
      id: user_id,
      name: name || null,
      email: email,
      password_hash,
      role: USER_ROLES.STUDENT,
      status: userStatus,
      entity_id: targetEntityId,
      phone_number: phone_number || null,
      address: address || null,
      gender: gender || null,
      roll_number: roll_number || null,
    });

    // If from representative or public link, notify student (password setup only when needed)
    if (isFromRepresentative || isFromPublicLink) {
      if (!user.password_hash) {
        const emailSent = await sendStudentApprovalEmail(
          user.email,
          user.name || name,
          getUserInvitationLink(user.id),
          {
            title: exam.title,
            description: exam.description,
            start_time: exam.start_time,
          }
        );

        if (!emailSent) {
          console.error("Failed to send student approval email");
        }
      }
    }
  }

  // Use the existing invite flow - check if user is already enrolled
  const existingEnrollment = await Enrollment.findOne({
    where: {
      exam_id: submission.exam_id,
      user_id: user.id,
    },
  });

  if (!existingEnrollment) {
    // Create enrollment (same as inviteStudent flow)
    await Enrollment.create({
      exam_id: submission.exam_id,
      user_id: user.id,
      status: ENROLLMENT_STATUS.UPCOMING,
      metadata: {
        invited_by: req.user.id,
        invited_at: new Date(),
        from_submission: submission.id,
      },
    });

    // Initialize result (same as inviteStudent flow)
    await Result.findOrCreate({
      where: {
        user_id: user.id,
        exam_id: submission.exam_id,
      },
      defaults: {
        user_id: user.id,
        exam_id: submission.exam_id,
        score: null,
        metadata: {
          correct_answer: 0,
          incorrect_answer: 0,
          no_answers: 0,
        },
      },
    });
  }

  // Update submission status to APPROVED
  await submission.update({
    status: SUBMISSION_STATUS.APPROVED,
  });

  return res.status(200).json(
    new ApiResponse("SUBMISSION_APPROVED", {
      id: submission.id,
      status: submission.status,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      enrolled: !existingEnrollment,
    })
  );
});
