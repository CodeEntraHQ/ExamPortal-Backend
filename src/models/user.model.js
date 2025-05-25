// models/User.js
import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("admin", "student"),
    defaultValue: "student",
    allowNull: false,
  },
});

// Hook to auto-generate ID like ex001, ex002...
User.beforeCreate(async (course) => {
  const users = await User.findAll({ attributes: ["id"] });

  const numbers = users
    .map((u) => parseInt(u.id?.replace("usr", "")))
    .filter((num) => !isNaN(num));

  const maxId = numbers.length ? Math.max(...numbers) : 0;
  const newId = `usr${String(maxId + 1).padStart(3, "0")}`;

  course.id = newId;
});

export default User;
