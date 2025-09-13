import bcrypt from "bcrypt";
import http from "http";

import app from "#app.js";
import sequelize from "#db/index.js";
import User from "#models/user.model.js";

let server;

beforeAll(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(resolve));
  await sequelize.sync({ force: true });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("password", salt);

  await User.create({
    name: "Super Admin",
    email: "superadmin@example.com",
    password_hash: hashedPassword,
    role: "SUPERADMIN",
    active: true,
  });
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  await sequelize.close();
});

afterEach(async () => {
  await sequelize.truncate({ cascade: true });
});

export { server };
