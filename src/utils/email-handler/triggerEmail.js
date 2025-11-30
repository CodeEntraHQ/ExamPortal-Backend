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

export { sendInvitationEmail, sendPasswordResetEmail, sendExamInvitationEmail };
