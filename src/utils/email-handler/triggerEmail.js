import nodemailer from "nodemailer";

import { logInfo } from "#utils/logger.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// HTML escaping utility to prevent injection
const escapeHtml = (text) => {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
};

const sendEmail = async (mailOptions) => {
  let triggerEmailSuccess;
  let response;
  const startTime = Date.now();
  try {
    const info = await transporter.sendMail(mailOptions);
    triggerEmailSuccess = info.accepted && info.accepted.length > 0;
    response = info.response;
  } catch (error) {
    triggerEmailSuccess = false;
    response = error.message;
  }
  const latency = Date.now() - startTime;
  logInfo({
    action: "TRIGGER_EMAIL",
    message: {
      status: triggerEmailSuccess ? "SUCCESS" : "FAILURE",
      response: response,
      latency: latency,
    },
  });
  return triggerEmailSuccess;
};

const sendInvitationEmail = async (to, role, resetLink, options = {}) => {
  try {
    const formattedRole = role
      ? role.charAt(0) + role.slice(1).toLowerCase()
      : "User";
    const { entityName } = options;

    // Escape HTML to prevent injection
    const safeEntityName = escapeHtml(entityName || "ExamEntra");

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: to,
      subject: "ExamEntra User Invitation",
      html: `
      <table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Segoe UI', sans-serif; background-color: #f0f4f8; padding: 40px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
            
            <!-- Header / Logo -->
            <tr>
              <td align="center" style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); padding: 20px;">
                <h1 style="color: #ffffff; margin-top: 20px; font-size: 24px;">You're Invited to Join ExamEntra!</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 40px; color: #333333;">
                <p style="font-size: 16px; line-height: 1.6;">
                  Hello ${formattedRole},
                </p>
                <p style="font-size: 16px; line-height: 1.6;">
                  You've been invited to join <strong>${safeEntityName}</strong> on <strong>ExamEntra</strong> — a smarter way to manage exams and performance.
                </p>
                <p style="font-size: 16px; line-height: 1.6;">
                  Please set your password by clicking the link below:
                </p>

                <p style="text-align: center; margin: 30px 0;">
                  <a href="${resetLink}" style="
                    background: linear-gradient(90deg, #10b981, #059669);
                    color: #ffffff;
                    padding: 14px 28px;
                    font-weight: bold;
                    text-decoration: none;
                    border-radius: 30px;
                    display: inline-block;
                    font-size: 16px;
                    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
                  ">
                    Set Your Password 🔐
                  </a>
                </p>

                <p style="font-size: 14px; color: #777777; text-align: center;">
                  After setting your password, you can login to your account using your email and password.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="background-color: #f8f8f8; padding: 20px; color: #aaaaaa; font-size: 12px;">
                &copy; ${new Date().getFullYear()} CodeEntra. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `,
    };
    const emailSent = await sendEmail(mailOptions);
    return emailSent;
  } catch (error) {
    console.error("❌ Error in sendInvitationEmail:", {
      to,
      role,
      error: error.message,
      stack: error.stack,
    });
    return false;
  }
};

const sendPasswordResetEmail = async (to, name, resetLink) => {
  const tokenExpiry = process.env.RESET_PASSWORD_TOKEN_EXPIRY;
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: to,
    subject: "ExamEntra Password Reset",
    html: `
      <table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Segoe UI', sans-serif; background-color: #f0f4f8; padding: 40px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
            
            <!-- Header / Logo -->
            <tr>
              <td align="center" style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); padding: 20px;">
                <h1 style="color: #ffffff; margin-top: 20px; font-size: 24px;">Reset Your Password</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 40px; color: #333333;">
                <p style="font-size: 16px; line-height: 1.6;">
                  Hello ${name || "there"},
                </p>
                <p style="font-size: 16px; line-height: 1.6;">
                  We received a request to reset your password for your <strong>ExamEntra</strong> account.
                  If you made this request, click the button below to reset your password.
                </p>

                <p style="text-align: center; margin: 30px 0;">
                  <a href="${resetLink}" style="
                    background: linear-gradient(90deg, #10b981, #059669);
                    color: #ffffff;
                    padding: 14px 28px;
                    font-weight: bold;
                    text-decoration: none;
                    border-radius: 30px;
                    display: inline-block;
                    font-size: 16px;
                    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
                  ">
                    Reset Password 🔐
                  </a>
                </p>

                <p style="font-size: 14px; color: #777777; text-align: center;">
                  This link will expire in <strong>${tokenExpiry || "60"} minutes</strong> for your security.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="background-color: #f8f8f8; padding: 20px; color: #aaaaaa; font-size: 12px;">
                &copy; ${new Date().getFullYear()} CodeEntra. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `,
  };
  const emailSent = await sendEmail(mailOptions);
  return emailSent;
};

const sendExamInvitationEmail = async (to, examName, options = {}) => {
  try {
    const { loginUrl } = options;

    // Use provided loginUrl or fallback to env variable or default
    const finalLoginUrl = loginUrl || process.env.FRONTEND_HOST;

    // Escape HTML to prevent injection
    const safeExamName = escapeHtml(examName || "Exam");

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: to,
      subject: "Exam Invitation - ExamEntra",
      html: `
      <table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Segoe UI', sans-serif; background-color: #f0f4f8; padding: 40px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
            
            <!-- Header / Logo -->
            <tr>
              <td align="center" style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); padding: 20px;">
                <h1 style="color: #ffffff; margin-top: 20px; font-size: 24px;">Exam Invitation</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 40px; color: #333333;">
                <p style="font-size: 16px; line-height: 1.6;">
                  Hello Student,
                </p>
                <p style="font-size: 16px; line-height: 1.6;">
                  You've been invited to take the exam: <strong>${safeExamName}</strong> on <strong>ExamEntra</strong>.
                  If you're ready to take this exam, click the button below to login to your account.
                </p>

                <p style="text-align: center; margin: 30px 0;">
                  <a href="${finalLoginUrl}" style="
                    background: linear-gradient(90deg, #10b981, #059669);
                    color: #ffffff;
                    padding: 14px 28px;
                    font-weight: bold;
                    text-decoration: none;
                    border-radius: 30px;
                    display: inline-block;
                    font-size: 16px;
                    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
                  ">
                    Login to ExamEntra 🚀
                  </a>
                </p>

                <p style="font-size: 14px; color: #777777; text-align: center;">
                  Use your email and password to login and access your exam.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="background-color: #f8f8f8; padding: 20px; color: #aaaaaa; font-size: 12px;">
                &copy; ${new Date().getFullYear()} CodeEntra. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `,
    };
    const emailSent = await sendEmail(mailOptions);
    return emailSent;
  } catch (error) {
    console.error("❌ Error in sendExamInvitationEmail:", {
      to,
      examName,
      error: error.message,
      stack: error.stack,
    });
    return false;
  }
};

const sendStudentApprovalEmail = async (
  to,
  name,
  passwordResetLink,
  examDetails
) => {
  try {
    const tokenExpiry = process.env.RESET_PASSWORD_TOKEN_EXPIRY || "60";

    // Escape HTML to prevent injection
    const safeName = escapeHtml(name || "Student");
    const safeExamName = escapeHtml(examDetails?.title || "Exam");
    const safeExamDescription = escapeHtml(examDetails?.description || "");
    const examDate = examDetails?.start_time
      ? new Date(examDetails.start_time).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "TBA";

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: to,
      subject: "Welcome to ExamEntra - Set Your Password",
      html: `
      <table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Segoe UI', sans-serif; background-color: #f0f4f8; padding: 40px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
            
            <!-- Header / Logo -->
            <tr>
              <td align="center" style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); padding: 20px;">
                <h1 style="color: #ffffff; margin-top: 20px; font-size: 24px;">Welcome to ExamEntra!</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 40px; color: #333333;">
                <p style="font-size: 16px; line-height: 1.6;">
                  Hello ${safeName},
                </p>
                <p style="font-size: 16px; line-height: 1.6;">
                  Your admission form submission has been approved! Your account has been created on <strong>ExamEntra</strong>.
                </p>
                
                <!-- Exam Details Section -->
                <div style="background-color: #f8f9fa; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 5px;">
                  <h2 style="color: #059669; margin-top: 0; font-size: 18px; margin-bottom: 15px;">📝 Exam Details</h2>
                  <p style="font-size: 15px; line-height: 1.8; margin: 8px 0;">
                    <strong>Exam Name:</strong> ${safeExamName}
                  </p>
                  ${
                    safeExamDescription
                      ? `
                  <p style="font-size: 15px; line-height: 1.8; margin: 8px 0;">
                    <strong>Description:</strong> ${safeExamDescription}
                  </p>
                  `
                      : ""
                  }
                  <p style="font-size: 15px; line-height: 1.8; margin: 8px 0;">
                    <strong>Exam Date:</strong> ${examDate}
                  </p>
                </div>

                <p style="font-size: 16px; line-height: 1.6; margin-top: 25px;">
                  To get started, please set your password by clicking the button below:
                </p>

                <p style="text-align: center; margin: 30px 0;">
                  <a href="${passwordResetLink}" style="
                    background: linear-gradient(90deg, #10b981, #059669);
                    color: #ffffff;
                    padding: 14px 28px;
                    font-weight: bold;
                    text-decoration: none;
                    border-radius: 30px;
                    display: inline-block;
                    font-size: 16px;
                    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
                  ">
                    Set Your Password 🔐
                  </a>
                </p>

                <p style="font-size: 14px; color: #777777; text-align: center;">
                  This link will expire in <strong>${tokenExpiry} minutes</strong> for your security.
                </p>
                <p style="font-size: 14px; color: #777777; text-align: center; margin-top: 10px;">
                  After setting your password, you can login to your account and access your exam.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="background-color: #f8f8f8; padding: 20px; color: #aaaaaa; font-size: 12px;">
                &copy; ${new Date().getFullYear()} CodeEntra. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `,
    };
    const emailSent = await sendEmail(mailOptions);
    return emailSent;
  } catch (error) {
    console.error("❌ Error in sendStudentApprovalEmail:", {
      to,
      name,
      error: error.message,
      stack: error.stack,
    });
    return false;
  }
};

const sendRepresentativeExamInviteEmail = async (
  to,
  {
    representativeName,
    examTitle,
    examType,
    durationSeconds,
    entityName,
    startDate,
    endDate,
    loginUrl,
  } = {}
) => {
  try {
    const safeRepName = escapeHtml(representativeName || "Representative");
    const safeExamTitle = escapeHtml(examTitle || "Exam");
    const safeExamType = escapeHtml(examType || "Assessment");
    const safeEntityName = escapeHtml(entityName || "your institution");
    const finalLoginUrl = loginUrl || process.env.LOGIN_PORTAL_URL;

    const durationMinutes = durationSeconds
      ? Math.round(Number(durationSeconds) / 60)
      : null;

    const startDateDisplay = startDate
      ? new Date(startDate).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "TBA";

    const endDateDisplay = endDate
      ? new Date(endDate).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to,
      subject: "You are invited to manage an exam - ExamEntra",
      html: `
      <table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Segoe UI', sans-serif; background-color: #f0f4f8; padding: 40px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
              <tr>
                <td align="center" style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); padding: 20px;">
                  <h1 style="color: #ffffff; margin-top: 10px; margin-bottom: 0; font-size: 22px;">Exam Invitation for Representative</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 32px; color: #333333;">
                  <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                    Hello ${safeRepName},
                  </p>
                  <p style="font-size: 16px; line-height: 1.6; margin: 0 0 18px 0;">
                    You have been invited by <strong>${safeEntityName}</strong> to manage student enrollments for the exam <strong>${safeExamTitle}</strong>.
                  </p>

                  <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; margin: 18px 0;">
                    <h3 style="margin: 0 0 12px 0; color: #059669; font-size: 16px;">Exam Details</h3>
                    <p style="margin: 4px 0; font-size: 15px;"><strong>Title:</strong> ${safeExamTitle}</p>
                    <p style="margin: 4px 0; font-size: 15px;"><strong>Type:</strong> ${safeExamType}</p>
                    ${
                      durationMinutes
                        ? `<p style="margin: 4px 0; font-size: 15px;"><strong>Duration:</strong> ${durationMinutes} minutes</p>`
                        : ""
                    }
                    <p style="margin: 4px 0; font-size: 15px;"><strong>Starts:</strong> ${startDateDisplay}</p>
                    ${
                      endDateDisplay
                        ? `<p style="margin: 4px 0; font-size: 15px;"><strong>Ends:</strong> ${endDateDisplay}</p>`
                        : ""
                    }
                  </div>

                  <p style="font-size: 15px; line-height: 1.6; margin: 12px 0 20px 0;">
                    Please sign in to ExamEntra to enroll students and manage exam participation.
                  </p>

                  <p style="text-align: center; margin: 28px 0;">
                    <a href="${finalLoginUrl}" style="
                      background: linear-gradient(90deg, #10b981, #059669);
                      color: #ffffff;
                      padding: 12px 26px;
                      font-weight: 600;
                      text-decoration: none;
                      border-radius: 28px;
                      display: inline-block;
                      font-size: 15px;
                      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
                    ">
                      Go to ExamEntra →
                    </a>
                  </p>

                  <p style="font-size: 13px; color: #6b7280; text-align: center; margin-top: 10px;">
                    If you were not expecting this invitation, please ignore this email.
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center" style="background-color: #f8f8f8; padding: 16px; color: #9ca3af; font-size: 12px;">
                  &copy; ${new Date().getFullYear()} CodeEntra. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      `,
    };

    const emailSent = await sendEmail(mailOptions);
    return emailSent;
  } catch (error) {
    console.error("❌ Error in sendRepresentativeExamInviteEmail:", {
      to,
      examTitle,
      error: error.message,
      stack: error.stack,
    });
    return false;
  }
};

export {
  sendInvitationEmail,
  sendPasswordResetEmail,
  sendExamInvitationEmail,
  sendStudentApprovalEmail,
  sendRepresentativeExamInviteEmail,
};
