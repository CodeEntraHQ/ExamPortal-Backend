import http from "http";
import app from "../src/app.js";
import sequelize from "../src/db/index.js";

let server;

beforeAll(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(resolve));
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  await sequelize.close();
});

export { server };
