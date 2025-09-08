import http from "http";
import bcrypt from "bcrypt";
import app from "../src/app.js";
import sequelize from "../src/db/index.js";
import User from "../src/models/user.model.js";

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
