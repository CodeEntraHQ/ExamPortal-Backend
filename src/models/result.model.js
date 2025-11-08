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
      allowNull: false,
    },

    exam_id: {
      type: DataTypes.STRING,
      allowNull: false,
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
      { fields: ["exam_id"] },
      { fields: ["user_id"] },
      { fields: ["score"] },
      { fields: ["user_id", "exam_id"], unique: true }, // One result per user per exam
    ],
  }
);

Result.beforeCreate((result) => {
  result.id = generateUUID();
});

export default Result;
