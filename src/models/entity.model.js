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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(ENTITY_TYPE)),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
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
