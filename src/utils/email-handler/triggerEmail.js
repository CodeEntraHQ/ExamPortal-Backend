import nodemailer from "nodemailer";
import { logInfo } from "#utils/logger.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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

export const sendInvitationEmail = async (to, role, resetLink) => {
  const emailExpiry = process.env.INVITATION_TOKEN_EXPIRY;
  const formattedRole = role.charAt(0) + role.slice(1).toLowerCase();
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
              <td align="center" style="background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%); padding: 20px;">
                <h1 style="color: #ffffff; margin-top: 20px; font-size: 24px;">👋 You're Invited to Join ExamEntra!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px; color: #333333;">
                <p style="font-size: 16px; line-height: 1.6;">
                  Hello ${formattedRole},
                </p>
                <p style="font-size: 16px; line-height: 1.6;">
                  You've been invited to join <strong>ExamEntra</strong> — a smarter way to manage exams and performance.
                  Click the button below to accept your invitation and create your account.
                </p>
                <p style="text-align: center; margin: 30px 0;">
                  <a href="${resetLink}" style="
                    background: linear-gradient(90deg, #00c6ff, #0072ff);
                    color: #ffffff;
                    padding: 14px 28px;
                    font-weight: bold;
                    text-decoration: none;
                    border-radius: 30px;
                    display: inline-block;
                    font-size: 16px;
                    box-shadow: 0 4px 14px rgba(0, 114, 255, 0.3);
                  ">
                    Accept Invitation 🚀
                  </a>
                </p>

                <p style="font-size: 14px; color: #777777; text-align: center;">
                  This link will expire in <strong>${emailExpiry}ays</strong>.
                </p>
              </td>
            </tr>
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
