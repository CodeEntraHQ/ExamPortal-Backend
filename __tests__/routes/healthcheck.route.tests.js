import request from "supertest";

import { server } from "../setup.js";

describe("Health check Routes", () => {
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
});
