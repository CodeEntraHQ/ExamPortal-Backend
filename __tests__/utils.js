import request from "supertest";
import app from "../src/app";

export const login = async (email, password) => {
  const res = await request(app).post("/v1/users/login").send({
    email,
    password,
  });
  return res.body.payload.token;
};
