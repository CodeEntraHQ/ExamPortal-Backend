// models/User.js
import { DataTypes } from "sequelize";

import sequelize from "#db/index.js";
import {
  USER_GENDER,
  USER_ROLES,
  USER_STATUS,
} from "#utils/constants/model.constant.js";

const User = sequelize.define(
  "Users",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    bio: {
      type: DataTypes.STRING,
      allowNull: true,
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

    failed_login_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    two_fa_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    two_fa_secret_key: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    gender: {
      type: DataTypes.ENUM(USER_GENDER.MALE, USER_GENDER.FEMALE),
      allowNull: true,
    },

    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    last_failed_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    password_hash: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
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

    roll_number: {
      type: DataTypes.STRING,
      allowNull: true,
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
