import request from "supertest";

import sequelize from "#db/index.js";

import { server } from "../setup.js";

describe("Health check Routes", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return 200 with UP status for app health check", async () => {
    const res = await request(server).get("/v1/checks/app");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ status: "UP" });
  });

  it("should return 200 with UP status for db health check", async () => {
    const res = await request(server).get("/v1/checks/db");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ status: "UP" });
  });

  it("should return 500 with DOWN status for db health check when db is down", async () => {
    jest
      .spyOn(sequelize, "authenticate")
      .mockRejectedValue(new Error("DB is down"));
    const res = await request(server).get("/v1/checks/db");
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({ status: "DOWN" });
  });
});
