import request from "supertest";

import College from "#models/college.model.js";

import { server } from "../setup.js";
import { getAuthToken } from "../utils.js";

describe("College Routes", () => {
  let token;
  let collegeId;
  let nonExistentId = "a5f0cc74-47f7-4b9c-9505-9f2fc8cf9905";

  beforeEach(async () => {
    await College.destroy({ where: {} });
    token = await getAuthToken("superadmin@example.com", "password");
    const college = await College.create({
      name: "Test College",
      address: "Test Address",
    });
    collegeId = college.id;
  });

  describe("POST /v1/colleges", () => {
    it("should onboard a new college", async () => {
      const res = await request(server)
        .post("/v1/colleges")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "New Test College",
          address: "New Test Address",
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.responseCode).toBe("COLLEGE_ONBOARDED");
      expect(res.body.payload).toHaveProperty("id");
      expect(res.body.payload.name).toBe("New Test College");
      expect(res.body.payload.address).toBe("New Test Address");
    });

    it("should fail if name is not provided", async () => {
      const res = await request(server)
        .post("/v1/colleges")
        .set("Authorization", `Bearer ${token}`)
        .send({
          address: "Test Address",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("name is required");
    });

    it("should fail if address is not provided", async () => {
      const res = await request(server)
        .post("/v1/colleges")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test College",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("address is required");
    });

    it("should fail if college with same name exists", async () => {
      const res = await request(server)
        .post("/v1/colleges")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test College",
          address: "Another Address",
        });
      expect(res.statusCode).toEqual(409);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("COLLEGE_ALREADY_EXISTS");
      expect(res.body.responseMessage).toEqual(
        "College with this name already exists"
      );
    });

    it("should fail without authentication", async () => {
      const res = await request(server).post("/v1/colleges").send({
        name: "No Auth College",
        address: "No Auth Address",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual(
        "authorization header is required"
      );
    });

    it("should fail if user is not a superadmin", async () => {
      const studentToken = await getAuthToken(
        "student@example.com",
        "password"
      );
      const res = await request(server)
        .post("/v1/colleges")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          name: "Unauthorized College",
          address: "Unauthorized Address",
        });
      expect(res.statusCode).toEqual(403);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("AUTHORIZATION_FAILED");
      expect(res.body.responseMessage).toEqual(
        "User has insufficient permissions"
      );
    });

    it("should fail if name is not a string", async () => {
      const res = await request(server)
        .post("/v1/colleges")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: 123,
          address: "Test Address",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
    });

    it("should fail if address is not a string", async () => {
      const res = await request(server)
        .post("/v1/colleges")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test College",
          address: 123,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
    });
  });

  describe("GET /v1/colleges", () => {
    it("should list colleges", async () => {
      const res = await request(server)
        .get("/v1/colleges")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.responseCode).toBe("COLLEGES_FETCHED");
      expect(res.body.payload).toHaveProperty("total");
      expect(res.body.payload).toHaveProperty("page");
      expect(res.body.payload).toHaveProperty("limit");
      expect(res.body.payload).toHaveProperty("totalPages");
      expect(res.body.payload.colleges).toBeInstanceOf(Array);
      expect(res.body.payload.colleges.length).toBe(1);
      expect(res.body.payload.colleges[0]).toHaveProperty("id");
      expect(res.body.payload.colleges[0]).toHaveProperty("name");
      expect(res.body.payload.colleges[0]).toHaveProperty("address");
    });

    it("should return an empty array if there are no colleges", async () => {
      await College.destroy({ where: {} });
      const res = await request(server)
        .get("/v1/colleges")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.payload.colleges).toEqual([]);
    });

    it("should handle pagination", async () => {
      await College.create({ name: "College 2", address: "Address 2" });
      const res = await request(server)
        .get("/v1/colleges?page=1&limit=1")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.payload.colleges.length).toBe(1);
      expect(res.body.payload.totalPages).toBe(2);
    });

    it("should fail without authentication", async () => {
      const res = await request(server).get("/v1/colleges");
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual(
        "authorization header is required"
      );
    });

    it("should fail if user is not a superadmin", async () => {
      const studentToken = await getAuthToken(
        "student@example.com",
        "password"
      );
      const res = await request(server)
        .get("/v1/colleges")
        .set("Authorization", `Bearer ${studentToken}`);
      expect(res.statusCode).toEqual(403);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("AUTHORIZATION_FAILED");
      expect(res.body.responseMessage).toEqual(
        "User has insufficient permissions"
      );
    });

    it("should fail with invalid page parameter", async () => {
      const res = await request(server)
        .get("/v1/colleges?page=abc")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("page must be a number");
    });

    it("should fail with invalid limit parameter", async () => {
      const res = await request(server)
        .get("/v1/colleges?limit=abc")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("limit must be a number");
    });
  });

  describe("PATCH /v1/colleges", () => {
    it("should update a college", async () => {
      const res = await request(server)
        .patch(`/v1/colleges`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          college_id: collegeId,
          name: "Updated College Name",
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.payload.id).toEqual(collegeId);
      expect(res.body.payload.name).toBe("Updated College Name");
    });

    it("should fail if college does not exist", async () => {
      const res = await request(server)
        .patch(`/v1/colleges`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          college_id: nonExistentId,
          name: "Non-existent College",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("COLLEGE_NOT_FOUND");
      expect(res.body.responseMessage).toEqual("College not found");
    });

    it("should fail with invalid data", async () => {
      const res = await request(server)
        .patch(`/v1/colleges`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          college_id: collegeId,
          name: "", // empty name
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual(
        "name must have length greater than 1"
      );
    });

    it("should fail without authentication", async () => {
      const res = await request(server).patch(`/v1/colleges`).send({
        college_id: collegeId,
        name: "No Auth Update",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual(
        "authorization header is required"
      );
    });

    it("should fail if user is not a superadmin", async () => {
      const studentToken = await getAuthToken(
        "student@example.com",
        "password"
      );
      const res = await request(server)
        .patch(`/v1/colleges`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          college_id: collegeId,
          name: "Unauthorized Update",
        });
      expect(res.statusCode).toEqual(403);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("AUTHORIZATION_FAILED");
      expect(res.body.responseMessage).toEqual(
        "User has insufficient permissions"
      );
    });

    it("should fail if college_id is not a valid UUID", async () => {
      const res = await request(server)
        .patch(`/v1/colleges`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          college_id: "invalid-uuid",
          name: "Updated College Name",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
    });

    it("should fail if both name and address are missing", async () => {
      const res = await request(server)
        .patch(`/v1/colleges`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          college_id: collegeId,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual(
        "At least one of name or address is required"
      );
    });

    it("should update only the address", async () => {
      const res = await request(server)
        .patch(`/v1/colleges`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          college_id: collegeId,
          address: "Updated Address",
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("SUCCESS");
      expect(res.body.responseCode).toEqual("COLLEGE_UPDATED");
      expect(res.body.payload.id).toEqual(collegeId);
      expect(res.body.payload.address).toBe("Updated Address");
    });

    it("should fail with an empty address", async () => {
      const res = await request(server)
        .patch(`/v1/colleges`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          college_id: collegeId,
          address: "",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
    });
  });
});
