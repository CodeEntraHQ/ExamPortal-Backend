// Mock nodemailer at the top level. Jest will hoist this.
jest.mock("nodemailer");

describe("Email Handler", () => {
  // Before each test, reset modules to ensure a clean slate.
  // This is crucial because triggerEmail.js creates its transporter on module load.
  beforeEach(() => {
    jest.resetModules();
  });

  describe("sendInvitationEmail", () => {
    it("should send an invitation email successfully", async () => {
      // 1. Set up the mock for this specific test case
      const sendMailMock = jest.fn().mockResolvedValue({
        accepted: ["test@example.com"],
        response: "250 OK",
      });
      const nodemailer = require("nodemailer");
      nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

      // 2. Import the module under test (it will now use our mock)
      const {
        sendInvitationEmail,
      } = require("../../../src/utils/email-handler/triggerEmail");

      // 3. Call the function
      const result = await sendInvitationEmail(
        "test@example.com",
        "STUDENT",
        "http://reset.link"
      );

      // 4. Assert the results
      expect(result).toBe(true);
      expect(sendMailMock).toHaveBeenCalledTimes(1);
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: "ExamEntra User Invitation",
        })
      );
    });

    it("should return false if sending the invitation email fails", async () => {
      const sendMailMock = jest
        .fn()
        .mockRejectedValue(new Error("Email failed"));
      const nodemailer = require("nodemailer");
      nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

      const {
        sendInvitationEmail,
      } = require("../../../src/utils/email-handler/triggerEmail");

      const result = await sendInvitationEmail(
        "test@example.com",
        "STUDENT",
        "http://reset.link"
      );

      expect(result).toBe(false);
      expect(sendMailMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("should send a password reset email successfully", async () => {
      const sendMailMock = jest.fn().mockResolvedValue({
        accepted: ["test@example.com"],
        response: "250 OK",
      });
      const nodemailer = require("nodemailer");
      nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

      const {
        sendPasswordResetEmail,
      } = require("../../../src/utils/email-handler/triggerEmail");

      const result = await sendPasswordResetEmail(
        "test@example.com",
        "John Doe",
        "http://reset.link"
      );

      expect(result).toBe(true);
      expect(sendMailMock).toHaveBeenCalledTimes(1);
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: "ExamEntra Password Reset",
        })
      );
    });

    it("should return false if sending the password reset email fails", async () => {
      const sendMailMock = jest
        .fn()
        .mockRejectedValue(new Error("Email failed"));
      const nodemailer = require("nodemailer");
      nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

      const {
        sendPasswordResetEmail,
      } = require("../../../src/utils/email-handler/triggerEmail");

      const result = await sendPasswordResetEmail(
        "test@example.com",
        "John Doe",
        "http://reset.link"
      );

      expect(result).toBe(false);
      expect(sendMailMock).toHaveBeenCalledTimes(1);
    });
  });
});
