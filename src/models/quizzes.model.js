import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

const Quiz = sequelize.define("Quiz", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  title: DataTypes.STRING,
  description: DataTypes.STRING,
  time_limit: DataTypes.INTEGER,
  course_id: DataTypes.STRING,
});

// Hook to auto-generate ID like ex001, ex002...
Quiz.beforeCreate(async (course) => {
  const quizzes = await Quiz.findAll({ attributes: ["id"] });

  const numbers = quizzes
    .map((c) => parseInt(c.id?.replace("quz", "")))
    .filter((num) => !isNaN(num));

  const maxId = numbers.length ? Math.max(...numbers) : 0;
  const newId = `quz${String(maxId + 1).padStart(3, "0")}`;

  course.id = newId;
});

export default Quiz;
