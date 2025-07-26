import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

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
// Hook to auto-generate ID like ex001, ex002...
Question.beforeCreate(async (ques) => {
  const questions = await Question.findAll({ attributes: ["id"] });

  const numbers = questions
    .map((c) => parseInt(c.id?.replace("que", "")))
    .filter((num) => !isNaN(num));

  const maxId = numbers.length ? Math.max(...numbers) : 0;
  const newId = `que${String(maxId + 1).padStart(3, "0")}`;

  ques.id = newId;
});

export default Question;
