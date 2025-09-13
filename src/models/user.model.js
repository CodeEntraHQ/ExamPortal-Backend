// models/User.js
import { DataTypes } from "sequelize";

import sequelize from "#db/index.js";
import { USER_ROLES } from "#utils/constants.util.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    entity_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    password_hash: {
      type: DataTypes.STRING,
    },

    role: {
      type: DataTypes.ENUM(
        USER_ROLES.SUPERADMIN,
        USER_ROLES.ADMIN,
        USER_ROLES.STUDENT
      ),
      defaultValue: "STUDENT",
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE", "ACTIVATION_PENDING"),
      defaultValue: "INACTIVE",
      allowNull: false,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export default User;
