import request from "supertest";

import app from "../../src/app";
import { login } from "../utils";

describe("College Routes", () => {
  let token;

  beforeEach(async () => {
    token = await login("superadmin@example.com", "password");
  });

  describe("POST /v1/colleges", () => {
    it("should onboard a new college", async () => {
      const res = await request(app)
        .post("/v1/colleges")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test College",
          address: "Test Address",
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.responseMsg).toBe("COLLEGE_ONBOARDED");
      expect(res.body.payload).toHaveProperty("id");
      expect(res.body.payload).toHaveProperty("name");
      expect(res.body.payload).toHaveProperty("address");
    });
  });

  describe("GET /v1/colleges", () => {
    it("should list colleges", async () => {
      const res = await request(app)
        .get("/v1/colleges")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.responseMsg).toBe("COLLEGES_FETCHED");
      expect(res.body.payload).toHaveProperty("total");
      expect(res.body.payload).toHaveProperty("page");
      expect(res.body.payload).toHaveProperty("limit");
      expect(res.body.payload).toHaveProperty("totalPages");
      expect(res.body.payload).toHaveProperty("colleges");
    });
  });
});
