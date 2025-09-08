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
  console.log(triggerEmailSuccess);
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

export const sendInvitationEmail = async (to, resetLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: to,
    subject: "ExamEntra User Invitation",
    html: `
      <h2>User Invitation</h2>
      <p>Click <a href="${resetLink}">here</a> to accept the invitation</p>
      <p>This link will expire in 7 days.</p>
    `,
  };
  const emailSent = await sendEmail(mailOptions);
  return emailSent;
};
