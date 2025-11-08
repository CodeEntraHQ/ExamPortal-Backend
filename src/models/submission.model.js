import { DataTypes } from "sequelize";

import sequelize from "#db/index.js";
import { generateUUID } from "#utils/utils.js";

const Submission = sequelize.define(
  "Submissions",
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

    question_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    metadata: DataTypes.JSON,

    last_updated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,

    indexes: [
      { fields: ["exam_id"] },
      { fields: ["user_id"] },
      { fields: ["question_id"] },
      { fields: ["user_id", "exam_id", "question_id"], unique: true },
    ],
  }
);

Submission.beforeCreate((submission) => {
  submission.id = generateUUID();
});

export default Submission;
