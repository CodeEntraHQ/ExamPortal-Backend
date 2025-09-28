import request from "supertest";

import Entity from "#models/entity.model.js";
import { generateUUID } from "#utils/utils.js";

import { server } from "../setup.js";
import { getAuthToken } from "../utils.js";

describe("Exam Routes", () => {
  let token;
  let entityId;
  let examId;

  beforeAll(async () => {
    const entity = await Entity.create({
      name: "Test Entity",
      address: "Test Address",
    });
    entityId = entity.id;
  });

  beforeEach(async () => {
    token = await getAuthToken("superadmin@example.com", "password");
  });

  afterAll(async () => {
    await Entity.destroy({ where: {} });
  });

  describe("POST /v1/exams", () => {
    it("should create a new exam", async () => {
      const res = await request(server)
        .post("/v1/exams")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Test Exam",
          type: "QUIZ",
          entity_id: entityId,
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("SUCCESS");
      expect(res.body.responseCode).toEqual("EXAM_CREATED");
      expect(res.body.payload).toHaveProperty("id");
      expect(res.body.payload).toHaveProperty("title");
      examId = res.body.payload.id;
    });

    it("should fail if title is not provided", async () => {
      const res = await request(server)
        .post("/v1/exams")
        .set("Authorization", `Bearer ${token}`)
        .send({
          type: "QUIZ",
          entity_id: entityId,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("title is required");
    });

    it("should fail if entity_id is not provided", async () => {
      const res = await request(server)
        .post("/v1/exams")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Test Exam",
          type: "QUIZ",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual(
        "entity_id is required for SUPERADMIN"
      );
    });

    it("should fail if entity_id is invalid", async () => {
      const res = await request(server)
        .post("/v1/exams")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Test Exam",
          type: "QUIZ",
          entity_id: "invalid-id",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual(
        "entity_id must be a valid UUID"
      );
    });

    it("should fail if a non-SUPERADMIN user provides entity_id", async () => {
      const adminToken = await getAuthToken("admin@example.com", "password");
      const res = await request(server)
        .post("/v1/exams")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Test Exam",
          type: "QUIZ",
          entity_id: entityId,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual(
        "entity_id is required for SUPERADMIN"
      );
    });

    it("should create a new exam for an ADMIN user", async () => {
      const adminToken = await getAuthToken("admin@example.com", "password");
      const res = await request(server)
        .post("/v1/exams")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Test Exam by Admin",
          type: "QUIZ",
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("SUCCESS");
      expect(res.body.responseCode).toEqual("EXAM_CREATED");
      expect(res.body.payload).toHaveProperty("id");
      expect(res.body.payload).toHaveProperty("title", "Test Exam by Admin");
    });
  });

  describe("GET /v1/exams", () => {
    it("should fetch exams", async () => {
      const res = await request(server)
        .get(`/v1/exams?entity_id=${entityId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("SUCCESS");
      expect(res.body.responseCode).toEqual("EXAMS_FETCHED");
      expect(res.body.payload).toHaveProperty("exams");
      expect(Array.isArray(res.body.payload.exams)).toEqual(true);
    });

    it("should fail if entity_id is not provided", async () => {
      const res = await request(server)
        .get(`/v1/exams`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual(
        "entity_id is required for SUPERADMIN"
      );
    });

    it("should fetch exams for an ADMIN user", async () => {
      const adminToken = await getAuthToken("admin@example.com", "password");
      const res = await request(server)
        .get(`/v1/exams`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("SUCCESS");
      expect(res.body.responseCode).toEqual("EXAMS_FETCHED");
      expect(res.body.payload).toHaveProperty("exams");
      expect(Array.isArray(res.body.payload.exams)).toEqual(true);
    });

    it("should fetch exams for a STUDENT user", async () => {
      const studentToken = await getAuthToken(
        "student@example.com",
        "password"
      );
      const res = await request(server)
        .get(`/v1/exams`)
        .set("Authorization", `Bearer ${studentToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("SUCCESS");
      expect(res.body.responseCode).toEqual("EXAMS_FETCHED");
      expect(res.body.payload).toHaveProperty("exams");
      expect(Array.isArray(res.body.payload.exams)).toEqual(true);
    });

    it("should fetch exams for a SUPERADMIN user", async () => {
      const res = await request(server)
        .get(`/v1/exams?entity_id=${entityId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("SUCCESS");
      expect(res.body.responseCode).toEqual("EXAMS_FETCHED");
      expect(res.body.payload).toHaveProperty("exams");
      expect(Array.isArray(res.body.payload.exams)).toEqual(true);
    });

    it("should fetch exams for a SUPERADMIN user with entity_id", async () => {
      const res = await request(server)
        .get(`/v1/exams?entity_id=${entityId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("SUCCESS");
      expect(res.body.responseCode).toEqual("EXAMS_FETCHED");
      expect(res.body.payload).toHaveProperty("exams");
      expect(Array.isArray(res.body.payload.exams)).toEqual(true);
    });
  });

  describe("POST /v1/exams/question", () => {
    it("should create a new question", async () => {
      const res = await request(server)
        .post("/v1/exams/question")
        .set("Authorization", `Bearer ${token}`)
        .send({
          exam_id: examId,
          question_text: "What is 2+2?",
          type: "MCQ",
          metadata: {
            options: ["1", "2", "3", "4"],
            correct_answers: [3],
          },
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("SUCCESS");
      expect(res.body.responseCode).toEqual("QUESTION_CREATED");
      expect(res.body.payload).toHaveProperty("id");
    });

    it("should fail if exam_id is not provided", async () => {
      const res = await request(server)
        .post("/v1/exams/question")
        .set("Authorization", `Bearer ${token}`)
        .send({
          question_text: "What is 2+2?",
          type: "MCQ",
          metadata: {
            options: ["1", "2", "3", "4"],
            correct_answers: [3],
          },
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("exam_id is required");
    });

    it("should fail if question_text is not provided", async () => {
      const res = await request(server)
        .post("/v1/exams/question")
        .set("Authorization", `Bearer ${token}`)
        .send({
          exam_id: examId,
          type: "MCQ",
          metadata: {
            options: ["1", "2", "3", "4"],
            correct_answers: [3],
          },
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("question_text is required");
    });

    it("should fail if type is not provided", async () => {
      const res = await request(server)
        .post("/v1/exams/question")
        .set("Authorization", `Bearer ${token}`)
        .send({
          exam_id: examId,
          question_text: "What is 2+2?",
          metadata: {
            options: ["1", "2", "3", "4"],
            correct_answers: [3],
          },
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("Invalid input: expected MCQ");
    });

    it("should fail if metadata is not provided", async () => {
      const res = await request(server)
        .post("/v1/exams/question")
        .set("Authorization", `Bearer ${token}`)
        .send({
          exam_id: examId,
          question_text: "What is 2+2?",
          type: "MCQ",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual(
        "MCQ questions must have options and correct_answers"
      );
    });
  });

  describe("GET /v1/exams/question", () => {
    it("should fetch questions for an exam", async () => {
      const res = await request(server)
        .get(`/v1/exams/question?exam_id=${examId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("SUCCESS");
      expect(res.body.responseCode).toEqual("QUESTIONS_FETCHED");
      expect(res.body.payload).toHaveProperty("questions");
      expect(Array.isArray(res.body.payload.questions)).toEqual(true);
    });

    it("should fail if exam_id is not provided", async () => {
      const res = await request(server)
        .get(`/v1/exams/question`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("exam_id is required");
    });

    it("should fetch questions for a student without correct_answers", async () => {
      const studentToken = await getAuthToken(
        "student@example.com",
        "password"
      );
      const res = await request(server)
        .get(`/v1/exams/question?exam_id=${examId}`)
        .set("Authorization", `Bearer ${studentToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("SUCCESS");
      expect(res.body.responseCode).toEqual("QUESTIONS_FETCHED");
      expect(res.body.payload).toHaveProperty("questions");
      expect(Array.isArray(res.body.payload.questions)).toEqual(true);
      expect(res.body.payload.questions[0].metadata).not.toHaveProperty(
        "correct_answers"
      );
    });
  });

  describe("POST /v1/exams/invite", () => {
    it("should invite students to an exam", async () => {
      const res = await request(server)
        .post("/v1/exams/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          exam_id: examId,
          student_emails: ["student@example.com"],
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("SUCCESS");
      expect(res.body.responseCode).toEqual("STUDENT_INVITED");
    });

    it("should fail if exam_id is not provided", async () => {
      const res = await request(server)
        .post("/v1/exams/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          student_emails: ["student@example.com"],
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("exam_id is required");
    });

    it("should fail if student_emails is not provided", async () => {
      const res = await request(server)
        .post("/v1/exams/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          exam_id: examId,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("Invalid student_emails array");
    });

    it("should fail if student_emails is not an array", async () => {
      const res = await request(server)
        .post("/v1/exams/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          exam_id: examId,
          student_emails: "student@example.com",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("Invalid student_emails array");
    });

    it("should fail if exam is not found", async () => {
      const res = await request(server)
        .post("/v1/exams/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          exam_id: generateUUID(),
          student_emails: ["student@example.com"],
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("Exam not found");
    });

    it("should fail if no valid students are found", async () => {
      const res = await request(server)
        .post("/v1/exams/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          exam_id: examId,
          student_emails: ["invalid-student@example.com"],
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("No valid students found");
    });

    it("should fail if all students are already enrolled", async () => {
      // First, invite the student
      await request(server)
        .post("/v1/exams/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          exam_id: examId,
          student_emails: ["student@example.com"],
        });

      // Then, try to invite the same student again
      const res = await request(server)
        .post("/v1/exams/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          exam_id: examId,
          student_emails: ["student@example.com"],
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual(
        "All students are already enrolled"
      );
    });

    it("should invite valid students and return invalid emails", async () => {
      const newExamRes = await request(server)
        .post("/v1/exams")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "New Test Exam",
          type: "QUIZ",
          entity_id: entityId,
        });
      const newExamId = newExamRes.body.payload.id;

      const res = await request(server)
        .post("/v1/exams/invite")
        .set("Authorization", `Bearer ${token}`)
        .send({
          exam_id: newExamId,
          student_emails: [
            "student@example.com",
            "invalid-student@example.com",
          ],
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("SUCCESS");
      expect(res.body.responseCode).toEqual("STUDENT_INVITED");
      expect(res.body.payload.totalInvited).toEqual(1);
      expect(res.body.payload.invalidEmails).toEqual([
        "invalid-student@example.com",
      ]);
    });
  });
});
