// models/User.js
import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";
import { generateUUID } from "../utils/utils.js";

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

User.beforeCreate((user) => {
  user.id = generateUUID();
});

export default User;
