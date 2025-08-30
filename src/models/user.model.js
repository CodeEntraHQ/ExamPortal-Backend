// models/User.js
import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    entity_id: {
      type: DataTypes.STRING,
    },
    password_hash: DataTypes.STRING,

    role: {
      type: DataTypes.ENUM("SUPERADMIN", "ADMIN", "STUDENT"),
      defaultValue: "STUDENT",
    },
    active: DataTypes.BOOLEAN,
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
  }
);

User.beforeCreate(async (user) => {
  const users = await User.findAll({ attributes: ["id"] });

  const numbers = users
    .map((u) => parseInt(u.id?.replace("usr", "")))
    .filter((num) => !isNaN(num));

  const maxId = numbers.length ? Math.max(...numbers) : 0;
  const newId = `usr${String(maxId + 1).padStart(3, "0")}`;

  user.id = newId;
});

export default User;
