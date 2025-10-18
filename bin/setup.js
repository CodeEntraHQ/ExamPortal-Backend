import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

import sequelize from "../src/db/index.js";
import Entity from "../src/models/entity.model.js";
import User from "../src/models/user.model.js";
import {
  ENTITY_TYPE,
  USER_ROLES,
  USER_STATUS,
} from "../src/utils/constants/model.constant.js";

const users = [
  {
    email: "superadmin@example.com",
    password: "password",
    role: USER_ROLES.SUPERADMIN,
  },
  {
    email: "admin@example.com",
    password: "password",
    role: USER_ROLES.ADMIN,
  },
  {
    email: "student@example.com",
    password: "password",
    role: USER_ROLES.STUDENT,
  },
];

const setup = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    const entity = await Entity.create({
      name: "Dummy Entity",
      address: "Dummy Address",
      type: ENTITY_TYPE.SCHOOL,
      description: "This is a dummy entity created for testing purposes.",
      email: "dummy@example.com",
      phone_number: "1234567890",
    });
    console.log("Dummy entity created successfully.");

    for (const user of users) {
      const password_hash = await bcrypt.hash(user.password, 10);
      await User.create({
        id: randomUUID(),
        email: user.email,
        password_hash,
        role: user.role,
        status: USER_STATUS.ACTIVE,
        name: user.role.toLowerCase(),
        entity_id: entity.id,
      });
      console.log(`User ${user.email} created successfully.`);
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  } finally {
    await sequelize.close();
  }
};

setup();
