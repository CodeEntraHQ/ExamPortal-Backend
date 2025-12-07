import { DataTypes } from "sequelize";

import sequelize from "#db/index.js";
import { ENTITY_TYPE } from "#utils/constants/model.constant.js";
import { generateUUID } from "#utils/utils.js";

const Entity = sequelize.define(
  "Entities",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    logo_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    type: {
      type: DataTypes.ENUM(...Object.values(ENTITY_TYPE)),
      allowNull: false,
    },

    monitoring_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    timestamps: false,
  }
);

Entity.beforeCreate((entity) => {
  entity.id = generateUUID();
});

export default Entity;
