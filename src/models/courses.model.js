import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

const Course = sequelize.define("Course", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Hook to auto-generate ID like ex001, ex002...
Course.beforeCreate(async (course) => {
  const courses = await Course.findAll({ attributes: ["id"] });

  const numbers = courses
    .map((c) => parseInt(c.id?.replace("ex", "")))
    .filter((num) => !isNaN(num));

  const maxId = numbers.length ? Math.max(...numbers) : 0;
  const newId = `ex${String(maxId + 1).padStart(3, "0")}`;

  course.id = newId;
});

export default Course;
