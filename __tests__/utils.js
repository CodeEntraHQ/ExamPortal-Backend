import request from "supertest";

import { server } from "./setup.js";

export const getAuthToken = async (email, password) => {
  const res = await request(server).post("/v1/users/login").send({
    email,
    password,
  });
  return res.body.payload.token;
};
