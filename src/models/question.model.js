import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

const Question = sequelize.define("Question", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Hook to auto-generate ID like ex001, ex002...
Question.beforeCreate(async (course) => {
  const questions = await Question.findAll({ attributes: ["id"] });

  const numbers = questions
    .map((c) => parseInt(c.id?.replace("que", "")))
    .filter((num) => !isNaN(num));

  const maxId = numbers.length ? Math.max(...numbers) : 0;
  const newId = `que${String(maxId + 1).padStart(3, "0")}`;

  course.id = newId;
});

export default Question;
