import request from "supertest";

import Entity from "#models/entity.model.js";

import { server } from "../setup.js";
import { getAuthToken } from "../utils.js";

describe("Entity Routes", () => {
  let token;
  let entityId;
  let nonExistentId = "a5f0cc74-47f7-4b9c-9505-9f2fc8cf9905";

  beforeEach(async () => {
    await Entity.destroy({ where: {} });
    token = await getAuthToken("superadmin@example.com", "password");
    const entity = await Entity.create({
      name: "Test Entity",
      address: "Test Address",
    });
    entityId = entity.id;
  });

  afterAll(async () => {
    await Entity.destroy({ where: {} });
  });

  describe("POST /v1/entities", () => {
    it("should onboard a new entity", async () => {
      const res = await request(server)
        .post("/v1/entities")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "New Test Entity",
          address: "New Test Address",
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("SUCCESS");
      expect(res.body.responseCode).toEqual("ENTITY_ONBOARDED");
      expect(res.body.payload).toHaveProperty("id");
      expect(res.body.payload.name).toEqual("New Test Entity");
      expect(res.body.payload.address).toEqual("New Test Address");
    });

    it("should fail if name is not provided", async () => {
      const res = await request(server)
        .post("/v1/entities")
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
        .post("/v1/entities")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Entity",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("address is required");
    });

    it("should fail if entity with same name exists", async () => {
      const res = await request(server)
        .post("/v1/entities")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Entity",
          address: "Another Address",
        });
      expect(res.statusCode).toEqual(409);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("ENTITY_ALREADY_EXISTS");
      expect(res.body.responseMessage).toEqual(
        "Entity with this name already exists"
      );
    });

    it("should fail without authentication", async () => {
      const res = await request(server).post("/v1/entities").send({
        name: "No Auth Entity",
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
        .post("/v1/entities")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          name: "Unauthorized Entity",
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
        .post("/v1/entities")
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
        .post("/v1/entities")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Entity",
          address: 123,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
    });
  });

  describe("GET /v1/entities", () => {
    it("should list entities", async () => {
      const res = await request(server)
        .get("/v1/entities")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("SUCCESS");
      expect(res.body.responseCode).toEqual("ENTITIES_FETCHED");
      expect(res.body.payload).toHaveProperty("total");
      expect(res.body.payload).toHaveProperty("page");
      expect(res.body.payload).toHaveProperty("limit");
      expect(res.body.payload).toHaveProperty("totalPages");
      expect(res.body.payload.entities).toBeInstanceOf(Array);
      expect(res.body.payload.entities.length).toEqual(1);
      expect(res.body.payload.entities[0]).toHaveProperty("id");
      expect(res.body.payload.entities[0]).toHaveProperty("name");
      expect(res.body.payload.entities[0]).toHaveProperty("address");
    });

    it("should return an empty array if there are no entities", async () => {
      await Entity.destroy({ where: {} });
      const res = await request(server)
        .get("/v1/entities")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.payload.entities).toEqual([]);
    });

    it("should handle pagination", async () => {
      await Entity.create({ name: "Entity 2", address: "Address 2" });
      const res = await request(server)
        .get("/v1/entities?page=1&limit=1")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.payload.entities.length).toEqual(1);
      expect(res.body.payload.totalPages).toEqual(2);
    });

    it("should fail without authentication", async () => {
      const res = await request(server).get("/v1/entities");
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
        .get("/v1/entities")
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
        .get("/v1/entities?page=abc")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("page must be a number");
    });

    it("should fail with page is less than 1", async () => {
      const res = await request(server)
        .get("/v1/entities?page=0")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("page must be greater than 1");
    });

    it("should fail with invalid limit parameter", async () => {
      const res = await request(server)
        .get("/v1/entities?limit=abc")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
      expect(res.body.responseMessage).toEqual("limit must be a number");
    });
  });

  describe("PATCH /v1/entities", () => {
    it("should update a entity", async () => {
      const res = await request(server)
        .patch(`/v1/entities`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          entity_id: entityId,
          name: "Updated Entity Name",
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.payload.id).toEqual(entityId);
      expect(res.body.payload.name).toEqual("Updated Entity Name");
    });

    it("should fail if entity does not exist", async () => {
      const res = await request(server)
        .patch(`/v1/entities`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          entity_id: nonExistentId,
          name: "Non-existent Entity",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("ENTITY_NOT_FOUND");
      expect(res.body.responseMessage).toEqual("Entity not found");
    });

    it("should fail with invalid data", async () => {
      const res = await request(server)
        .patch(`/v1/entities`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          entity_id: entityId,
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
      const res = await request(server).patch(`/v1/entities`).send({
        entity_id: entityId,
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
        .patch(`/v1/entities`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          entity_id: entityId,
          name: "Unauthorized Update",
        });
      expect(res.statusCode).toEqual(403);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("AUTHORIZATION_FAILED");
      expect(res.body.responseMessage).toEqual(
        "User has insufficient permissions"
      );
    });

    it("should fail if entity_id is not a valid UUID", async () => {
      const res = await request(server)
        .patch(`/v1/entities`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          entity_id: "invalid-uuid",
          name: "Updated Entity Name",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
    });

    it("should fail if both name and address are missing", async () => {
      const res = await request(server)
        .patch(`/v1/entities`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          entity_id: entityId,
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
        .patch(`/v1/entities`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          entity_id: entityId,
          address: "Updated Address",
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("SUCCESS");
      expect(res.body.responseCode).toEqual("ENTITY_UPDATED");
      expect(res.body.payload.id).toEqual(entityId);
      expect(res.body.payload.address).toEqual("Updated Address");
    });

    it("should fail with an empty address", async () => {
      const res = await request(server)
        .patch(`/v1/entities`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          entity_id: entityId,
          address: "",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("FAILURE");
      expect(res.body.responseCode).toEqual("BAD_REQUEST");
    });
  });
});
