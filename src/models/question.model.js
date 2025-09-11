import { DataTypes } from "sequelize";

import sequelize from "#db/index.js";
import { generateUUID } from "#utils/utils.js";

const Question = sequelize.define(
  "Question",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },

    exam_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    question_text: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("MCQ", "ONEWORD"),
      allowNull: false,
    },

    metadata: {
      type: DataTypes.JSON,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    indexes: [{ fields: ["id"] }, { fields: ["exam_id"] }],
  }
);
// Hook to auto-generate ID using UUID
Question.beforeCreate((question) => {
  question.id = generateUUID();
});

export default Question;
