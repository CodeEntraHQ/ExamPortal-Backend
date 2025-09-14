import request from "supertest";

import College from "#models/college.model.js";
import User from "#models/user.model.js";
import asyncLocalStorage from "#utils/context.js";
import {
  getUserInvitationLink,
  getResetPasswordLink,
} from "#utils/crypto.util.js";
import * as triggerEmail from "#utils/email-handler/triggerEmail.js";
import { generateUUID } from "#utils/utils.js";

import { server } from "../setup.js";
import { getAuthToken } from "../utils.js";

describe("User Routes", () => {
  let token;
  let collegeId;

  beforeAll(async () => {
    const college = await College.create({
      name: "Test College",
      address: "Test Address",
    });
    collegeId = college.id;
  });

  beforeEach(async () => {
    jest
      .spyOn(triggerEmail, "sendInvitationEmail")
      .mockImplementation(() => true);
    jest
      .spyOn(triggerEmail, "sendPasswordResetEmail")
      .mockImplementation(() => true);
    token = await getAuthToken("superadmin@example.com", "password");
  });

  afterAll(async () => {
    await College.destroy({ where: {} });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("POST /v1/users/login", () => {
    it("should login a user", async () => {
      const res = await request(server).post("/v1/users/login").send({
        email: "superadmin@example.com",
        password: "password",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.responseCode).toBe("LOGIN_SUCCESSFUL");
      expect(res.body.payload).toHaveProperty("token");
      expect(res.body.payload.user).toHaveProperty("id");
      expect(res.body.payload.user.role).toBe("SUPERADMIN");
    });

    it("should fail to login with wrong credentials", async () => {
      const res = await request(server).post("/v1/users/login").send({
        email: "wrong@example.com",
        password: "wrongpassword",
      });
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("AUTHENTICATION_FAILED");
    });

    it("should fail to login with wrong password", async () => {
      const res = await request(server).post("/v1/users/login").send({
        email: "superadmin@example.com",
        password: "wrongpassword",
      });
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("AUTHENTICATION_FAILED");
      expect(res.body.responseMessage).toBe("Invalid credentials");
    });
  });

  describe("GET /v1/users", () => {
    it("should list users", async () => {
      const res = await request(server)
        .get(`/v1/users?college_id=${collegeId}&role=ADMIN`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.responseCode).toBe("USERS_FETCHED");
      expect(res.body.payload).toHaveProperty("users");
      expect(Array.isArray(res.body.payload.users)).toBe(true);
    });

    it("should return an empty array if no users are found", async () => {
      const res = await request(server)
        .get(`/v1/users?college_id=${collegeId}&role=ADMIN`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.responseCode).toBe("USERS_FETCHED");
      expect(res.body.payload.users).toEqual([]);
    });
  });

  describe("POST /v1/users/invite", () => {
    it("should invite a new user", async () => {
      const res = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: `student_${Date.now()}@example.com`,
          role: "STUDENT",
          college_id: collegeId,
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.responseCode).toBe("USER_INVITED");
      expect(res.body.payload).toHaveProperty("id");
    });

    it("should not allow a student to invite a user", async () => {
      const studentEmail = `student_${Date.now()}@example.com`;
      // First, invite a user to get a valid registration token
      const inviteRes = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: studentEmail,
          role: "STUDENT",
          college_id: collegeId,
        });
      const userId = inviteRes.body.payload.id;

      let authToken;
      await asyncLocalStorage.run({ session_id: "test" }, () => {
        const invitationLink = getUserInvitationLink(userId);
        authToken = invitationLink.split("?token=")[1];
      });

      await request(server)
        .post("/v1/users/register")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Student",
          password: "password",
        });

      const studentToken = await getAuthToken(studentEmail, "password");

      const res = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          email: `student2_${Date.now()}@example.com`,
          role: "STUDENT",
          college_id: collegeId,
        });
      expect(res.statusCode).toEqual(403);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("AUTHORIZATION_FAILED");
      expect(res.body.responseMessage).toBe(
        "User has insufficient permissions"
      );
    });

    it("should not allow an admin to invite another admin", async () => {
      const adminEmail1 = `admin1_${Date.now()}@example.com`;
      const adminEmail2 = `admin2_${Date.now()}@example.com`;

      // Invite and register first admin
      const inviteRes1 = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({ email: adminEmail1, role: "ADMIN", college_id: collegeId });
      const userId1 = inviteRes1.body.payload.id;
      let authToken1;
      await asyncLocalStorage.run({ session_id: "test" }, () => {
        const invitationLink = getUserInvitationLink(userId1);
        authToken1 = invitationLink.split("?token=")[1];
      });
      await request(server)
        .post("/v1/users/register")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ name: "Admin One", password: "password" });
      const adminToken1 = await getAuthToken(adminEmail1, "password");

      const res = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${adminToken1}`)
        .send({
          email: adminEmail2,
          role: "ADMIN",
          college_id: collegeId,
        });
      expect(res.statusCode).toEqual(403);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("AUTHORIZATION_FAILED");
      expect(res.body.responseMessage).toBe(
        "User invitation hierarchy violated"
      );
    });

    it("should not allow a superadmin to invite another superadmin", async () => {
      const res = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: `superadmin_${Date.now()}@example.com`,
          role: "SUPERADMIN",
          college_id: collegeId,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("BAD_REQUEST");
      expect(res.body.responseMessage).toBe(
        "Invalid option: expected one of ADMIN|STUDENT"
      );
    });

    it("should return an error if college_id is not provided by superadmin", async () => {
      const res = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: `student_${Date.now()}@example.com`,
          role: "STUDENT",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("BAD_REQUEST");
      expect(res.body.responseMessage).toBe(
        "college_id is required for SUPERADMIN"
      );
    });

    it("should return an error if the user is already registered with another college", async () => {
      const studentEmail = `student_${Date.now()}@example.com`;
      // Invite and register the user with the first college
      await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: studentEmail,
          role: "STUDENT",
          college_id: collegeId,
        });

      const otherCollege = await College.create({
        name: "Other College",
        address: "Other Address",
      });

      const res = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: studentEmail,
          role: "STUDENT",
          college_id: otherCollege.id,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("BAD_REQUEST");
      expect(res.body.responseMessage).toBe("user is already registered");
    });

    it("should return an error if the user is already active", async () => {
      const studentEmail = `student_${Date.now()}@example.com`;
      // Invite and register the user
      const inviteRes = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: studentEmail,
          role: "STUDENT",
          college_id: collegeId,
        });
      const userId = inviteRes.body.payload.id;
      let authToken;
      await asyncLocalStorage.run({ session_id: "test" }, () => {
        const invitationLink = getUserInvitationLink(userId);
        authToken = invitationLink.split("?token=")[1];
      });
      await request(server)
        .post("/v1/users/register")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Test Student", password: "password" });

      const res = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: studentEmail,
          role: "STUDENT",
          college_id: collegeId,
        });
      expect(res.statusCode).toEqual(409);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("USER_IS_ACTIVE");
      expect(res.body.responseMessage).toBe("User is already active");
    });

    it("should re-invite an inactive user", async () => {
      const studentEmail = `student_${Date.now()}@example.com`;
      // Invite, register, and deregister the user
      const inviteRes = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: studentEmail,
          role: "STUDENT",
          college_id: collegeId,
        });
      const userId = inviteRes.body.payload.id;
      let authToken;
      await asyncLocalStorage.run({ session_id: "test" }, () => {
        const invitationLink = getUserInvitationLink(userId);
        authToken = invitationLink.split("?token=")[1];
      });
      await request(server)
        .post("/v1/users/register")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Test Student", password: "password" });
      const studentToken = await getAuthToken(studentEmail, "password");
      await request(server)
        .patch("/v1/users/deregister")
        .set("Authorization", `Bearer ${studentToken}`);

      const res = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: studentEmail,
          role: "STUDENT",
          college_id: collegeId,
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.responseCode).toBe("USER_INVITED");
    });

    it("should re-invite a user with activation pending", async () => {
      const studentEmail = `student_${Date.now()}@example.com`;
      // Invite the user
      await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: studentEmail,
          role: "STUDENT",
          college_id: collegeId,
        });

      const res = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: studentEmail,
          role: "STUDENT",
          college_id: collegeId,
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.responseCode).toBe("USER_INVITED");
    });

    it("should return an error if the email fails to send", async () => {
      jest
        .spyOn(triggerEmail, "sendInvitationEmail")
        .mockImplementation(() => false);

      const res = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: `student_${Date.now()}@example.com`,
          role: "STUDENT",
          college_id: collegeId,
        });
      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("SEND_EMAIL_FAILURE");
      expect(res.body.responseMessage).toBe("Unable to send email");
    });

    it("should return an error if the email fails to send for a new user", async () => {
      jest
        .spyOn(triggerEmail, "sendInvitationEmail")
        .mockImplementation(() => false);

      const res = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: `student_${Date.now()}@example.com`,
          role: "STUDENT",
          college_id: collegeId,
        });
      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("SEND_EMAIL_FAILURE");
      expect(res.body.responseMessage).toBe("Unable to send email");
    });

    it("should return an error if the email fails to send for an inactive user", async () => {
      const studentEmail = `student_${Date.now()}@example.com`;
      // Invite, register, and deregister the user
      const inviteRes = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: studentEmail,
          role: "STUDENT",
          college_id: collegeId,
        });
      const userId = inviteRes.body.payload.id;
      let authToken;
      await asyncLocalStorage.run({ session_id: "test" }, () => {
        const invitationLink = getUserInvitationLink(userId);
        authToken = invitationLink.split("?token=")[1];
      });
      await request(server)
        .post("/v1/users/register")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Test Student", password: "password" });
      const studentToken = await getAuthToken(studentEmail, "password");
      await request(server)
        .patch("/v1/users/deregister")
        .set("Authorization", `Bearer ${studentToken}`);

      jest
        .spyOn(triggerEmail, "sendInvitationEmail")
        .mockImplementation(() => false);

      const res = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: studentEmail,
          role: "STUDENT",
          college_id: collegeId,
        });
      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("SEND_EMAIL_FAILURE");
      expect(res.body.responseMessage).toBe("Unable to send email");
    });
  });

  describe("POST /v1/users/register", () => {
    it("should register a new user", async () => {
      // First, invite a user to get a valid registration token
      const inviteRes = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: `student_${Date.now()}@example.com`,
          role: "STUDENT",
          college_id: collegeId,
        });
      const userId = inviteRes.body.payload.id;

      let authToken;
      await asyncLocalStorage.run({ session_id: "test" }, () => {
        const invitationLink = getUserInvitationLink(userId);
        authToken = invitationLink.split("?token=")[1];
      });

      const res = await request(server)
        .post("/v1/users/register")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Student",
          password: "password",
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.responseCode).toBe("USER_REGISTERED");
      expect(res.body.payload).toHaveProperty("id");
    });
  });

  describe("POST /v1/users/password/forgot", () => {
    it("should initiate password reset", async () => {
      const res = await request(server).post("/v1/users/password/forgot").send({
        email: "superadmin@example.com",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.responseCode).toBe("RESET_PASSWORD_INITIATED");
    });

    it("should return an error if the user is not found", async () => {
      const res = await request(server).post("/v1/users/password/forgot").send({
        email: "nonexistent@example.com",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("BAD_REQUEST");
      expect(res.body.responseMessage).toBe("User not found");
    });

    it("should return an error if the user is inactive", async () => {
      const studentEmail = `student_${Date.now()}@example.com`;
      // Invite, register, and deregister the user
      const inviteRes = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: studentEmail,
          role: "STUDENT",
          college_id: collegeId,
        });
      const userId = inviteRes.body.payload.id;
      let authToken;
      await asyncLocalStorage.run({ session_id: "test" }, () => {
        const invitationLink = getUserInvitationLink(userId);
        authToken = invitationLink.split("?token=")[1];
      });
      await request(server)
        .post("/v1/users/register")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Test Student", password: "password" });
      const studentToken = await getAuthToken(studentEmail, "password");
      await request(server)
        .patch("/v1/users/deregister")
        .set("Authorization", `Bearer ${studentToken}`);

      const res = await request(server).post("/v1/users/password/forgot").send({
        email: studentEmail,
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("USER_INACTIVE");
      expect(res.body.responseMessage).toBe("User is not in active state");
    });

    it("should return an error if the email fails to send", async () => {
      jest
        .spyOn(triggerEmail, "sendPasswordResetEmail")
        .mockImplementation(() => false);

      const res = await request(server).post("/v1/users/password/forgot").send({
        email: "superadmin@example.com",
      });
      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("SEND_EMAIL_FAILURE");
      expect(res.body.responseMessage).toBe(
        "Unable to send password reset email"
      );
    });
  });

  describe("POST /v1/users/password/reset", () => {
    it("should reset password", async () => {
      // First, get a valid password reset token
      const user = await User.findOne({
        where: { email: "superadmin@example.com" },
      });
      let authToken;
      await asyncLocalStorage.run({ session_id: "test" }, () => {
        const invitationLink = getResetPasswordLink(user.id);
        authToken = invitationLink.split("?token=")[1];
      });

      const res = await request(server)
        .post("/v1/users/password/reset")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          password: "password",
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.responseCode).toBe("RESET_PASSWORD_SUCCESSFUL");
    });
  });

  describe("POST /v1/users/renew", () => {
    it("should renew a user session", async () => {
      const res = await request(server)
        .post("/v1/users/renew")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.responseCode).toBe("RENEW_SUCCESSFUL");
      expect(res.body.payload).toHaveProperty("token");
    });

    it("should fail to renew with an invalid token", async () => {
      const res = await request(server)
        .post("/v1/users/renew")
        .set("Authorization", "Bearer a.b.c");
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("AUTHENTICATION_FAILED");
      expect(res.body.responseMessage).toBe("Invalid token details");
    });

    it("should fail to renew if the user is not found", async () => {
      const studentEmail = `student_${Date.now()}@example.com`;
      // Invite and register the user
      const inviteRes = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: studentEmail,
          role: "STUDENT",
          college_id: collegeId,
        });
      const userId = inviteRes.body.payload.id;
      let authToken;
      await asyncLocalStorage.run({ session_id: "test" }, () => {
        const invitationLink = getUserInvitationLink(userId);
        authToken = invitationLink.split("?token=")[1];
      });
      await request(server)
        .post("/v1/users/register")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Test Student", password: "password" });
      const studentToken = await getAuthToken(studentEmail, "password");

      // Deactivate the user
      await User.update({ status: "INACTIVE" }, { where: { id: userId } });

      // Try to renew with the old token
      const res = await request(server)
        .post("/v1/users/renew")
        .set("Authorization", `Bearer ${studentToken}`);
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("AUTHENTICATION_FAILED");
      expect(res.body.responseMessage).toBe("User not found");
    });

    it("should fail to renew with a wrong token type", async () => {
      const user = await User.findOne({
        where: { email: "superadmin@example.com" },
      });
      let authToken;
      await asyncLocalStorage.run({ session_id: "test" }, () => {
        const invitationLink = getResetPasswordLink(user.id);
        authToken = invitationLink.split("?token=")[1];
      });

      const res = await request(server)
        .post("/v1/users/renew")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("AUTHENTICATION_FAILED");
      expect(res.body.responseMessage).toBe("Invalid token type");
    });
  });

  describe("PATCH /v1/users/deregister", () => {
    it("should deregister a user", async () => {
      const studentEmail = `student_${Date.now()}@example.com`;
      // First, invite a user to get a valid registration token
      const inviteRes = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: studentEmail,
          role: "STUDENT",
          college_id: collegeId,
        });
      const userId = inviteRes.body.payload.id;

      let authToken;
      await asyncLocalStorage.run({ session_id: "test" }, () => {
        const invitationLink = getUserInvitationLink(userId);
        authToken = invitationLink.split("?token=")[1];
      });

      await request(server)
        .post("/v1/users/register")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Student",
          password: "password",
        });

      const studentToken = await getAuthToken(studentEmail, "password");

      const res = await request(server)
        .patch("/v1/users/deregister")
        .set("Authorization", `Bearer ${studentToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.responseCode).toBe("USER_DEREGISTERED");

      // Verify that the user is actually deregistered
      const deregisteredUser = await User.findOne({
        where: { email: studentEmail },
      });
      expect(deregisteredUser.status).toBe("INACTIVE");
    });

    it("should not allow a superadmin to deregister itself", async () => {
      const res = await request(server)
        .patch("/v1/users/deregister")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(403);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("AUTHORIZATION_FAILED");
      expect(res.body.responseMessage).toBe(
        "User has insufficient permissions"
      );
    });

    it("should not allow a student to deregister another user", async () => {
      const studentEmail = `student_${Date.now()}@example.com`;
      // First, invite a user to get a valid registration token
      const inviteRes = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: studentEmail,
          role: "STUDENT",
          college_id: collegeId,
        });
      const userId = inviteRes.body.payload.id;

      let authToken;
      await asyncLocalStorage.run({ session_id: "test" }, () => {
        const invitationLink = getUserInvitationLink(userId);
        authToken = invitationLink.split("?token=")[1];
      });

      await request(server)
        .post("/v1/users/register")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Student",
          password: "password",
        });

      const studentToken = await getAuthToken(studentEmail, "password");

      const res = await request(server)
        .patch("/v1/users/deregister")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ user_id: generateUUID() });
      expect(res.statusCode).toEqual(403);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("AUTHORIZATION_FAILED");
      expect(res.body.responseMessage).toBe(
        "User has insufficient permissions"
      );
    });

    it("should return an error if the user to deregister is not found", async () => {
      const res = await request(server)
        .patch("/v1/users/deregister")
        .set("Authorization", `Bearer ${token}`)
        .send({ user_id: generateUUID() });
      expect(res.statusCode).toEqual(404);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("USER_NOT_FOUND");
      expect(res.body.responseMessage).toBe("User to deactivate not found");
    });

    it("should not allow an admin to deregister another admin", async () => {
      const adminEmail1 = `admin1_${Date.now()}@example.com`;
      const adminEmail2 = `admin2_${Date.now()}@example.com`;

      // Invite and register first admin
      const inviteRes1 = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({ email: adminEmail1, role: "ADMIN", college_id: collegeId });
      const userId1 = inviteRes1.body.payload.id;
      let authToken1;
      await asyncLocalStorage.run({ session_id: "test" }, () => {
        const invitationLink = getUserInvitationLink(userId1);
        authToken1 = invitationLink.split("?token=")[1];
      });
      await request(server)
        .post("/v1/users/register")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ name: "Admin One", password: "password" });
      const adminToken1 = await getAuthToken(adminEmail1, "password");

      // Invite and register second admin
      const inviteRes2 = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({ email: adminEmail2, role: "ADMIN", college_id: collegeId });
      const userId2 = inviteRes2.body.payload.id;

      const res = await request(server)
        .patch("/v1/users/deregister")
        .set("Authorization", `Bearer ${adminToken1}`)
        .send({ user_id: userId2 });
      expect(res.statusCode).toEqual(403);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("AUTHORIZATION_FAILED");
      expect(res.body.responseMessage).toBe(
        "User has insufficient permissions"
      );
    });

    it("should return an error if the user is already inactive", async () => {
      const studentEmail = `student_${Date.now()}@example.com`;
      // First, invite a user to get a valid registration token
      const inviteRes = await request(server)
        .post("/v1/users/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: studentEmail,
          role: "STUDENT",
          college_id: collegeId,
        });
      const userId = inviteRes.body.payload.id;

      let authToken;
      await asyncLocalStorage.run({ session_id: "test" }, () => {
        const invitationLink = getUserInvitationLink(userId);
        authToken = invitationLink.split("?token=")[1];
      });

      await request(server)
        .post("/v1/users/register")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Student",
          password: "password",
        });

      const studentToken = await getAuthToken(studentEmail, "password");

      // Deregister the user once
      await request(server)
        .patch("/v1/users/deregister")
        .set("Authorization", `Bearer ${studentToken}`);

      // Try to deregister again
      const res = await request(server)
        .patch("/v1/users/deregister")
        .set("Authorization", `Bearer ${token}`)
        .send({ user_id: userId });
      expect(res.statusCode).toEqual(409);
      expect(res.body.status).toBe("FAILURE");
      expect(res.body.responseCode).toBe("USER_IS_INACTIVE");
      expect(res.body.responseMessage).toBe("User is already inactive.");
    });
  });
});
