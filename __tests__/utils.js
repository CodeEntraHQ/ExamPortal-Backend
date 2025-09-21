import request from "supertest";

import { server } from "./setup.js";

export const getAuthToken = async (email, password) => {
  const captchaRes = await request(server).get("/v1/users/captcha");
  const captchaToken = captchaRes.body.payload.token;
  const captchaAnswer = captchaRes.body.payload.captchaAnswer;
  const res = await request(server)
    .post("/v1/users/login")
    .send({
      email,
      password,
      captcha: captchaAnswer,
    })
    .set("Authorization", `Bearer ${captchaToken}`);
  return res.body.payload.token;
};
