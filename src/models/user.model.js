// models/User.js
import { DataTypes } from "sequelize";

import sequelize from "#db/index.js";
import { USER_ROLES, USER_STATUS } from "#utils/constants/model.constant.js";

const User = sequelize.define(
  "Users",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },

    address: {
      type: DataTypes.STRING,
    },

    bio: {
      type: DataTypes.STRING,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    entity_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    name: {
      type: DataTypes.STRING,
    },

    password_hash: {
      type: DataTypes.STRING,
    },

    phone_number: {
      type: DataTypes.STRING,
    },

    profile_picture_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    role: {
      type: DataTypes.ENUM(
        USER_ROLES.SUPERADMIN,
        USER_ROLES.ADMIN,
        USER_ROLES.STUDENT
      ),
      defaultValue: USER_ROLES.STUDENT,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        USER_STATUS.ACTIVE,
        USER_STATUS.INACTIVE,
        USER_STATUS.ACTIVATION_PENDING
      ),
      defaultValue: USER_STATUS.INACTIVE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export default User;
