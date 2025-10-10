import { DataTypes } from "sequelize";

import sequelize from "#db/index.js";
import { generateUUID } from "#utils/utils.js";

const Result = sequelize.define(
  "Results",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.STRING,
      unique: true,
    },

    quiz_id: {
      type: DataTypes.STRING,
      unique: true,
    },

    score: DataTypes.INTEGER,

    metadata: DataTypes.JSON,

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,

    indexes: [
      { fields: ["quiz_id"] },
      { fields: ["user_id"] },
      { fields: ["score"] },
    ],
  }
);

Result.beforeCreate((result) => {
  result.id = generateUUID();
});

export default Result;
