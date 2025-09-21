import bcrypt from "bcrypt";
import http from "http";

import app from "#app.js";
import sequelize from "#db/index.js";
import User from "#models/user.model.js";
import { generateUUID } from "#utils/utils.js";

let server;

beforeAll(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(resolve));
  await sequelize.sync({ force: true });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("password", salt);

  await User.bulkCreate([
    {
      id: generateUUID(),
      name: "Super Admin",
      email: "superadmin@example.com",
      password_hash: hashedPassword,
      role: "SUPERADMIN",
      status: "ACTIVE",
      entity_id: generateUUID(),
    },
    {
      id: generateUUID(),
      name: "Admin User",
      email: "admin@example.com",
      password_hash: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
      entity_id: generateUUID(),
    },
    {
      id: generateUUID(),
      name: "Student User",
      email: "student@example.com",
      password_hash: hashedPassword,
      role: "STUDENT",
      status: "ACTIVE",
      entity_id: generateUUID(),
    },
  ]);
});

afterAll(async () => {
  await User.destroy({ where: {} });
  await new Promise((resolve) => server.close(resolve));
  await sequelize.close();
});

export { server };
