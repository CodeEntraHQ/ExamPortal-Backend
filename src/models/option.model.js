import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

const Option = sequelize.define("Option", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

// Hook to auto-generate ID like ex001, ex002...
Option.beforeCreate(async (course) => {
  const options = await Option.findAll({ attributes: ["id"] });

  const numbers = options
    .map((c) => parseInt(c.id?.replace("opt", "")))
    .filter((num) => !isNaN(num));

  const maxId = numbers.length ? Math.max(...numbers) : 0;
  const newId = `opt${String(maxId + 1).padStart(3, "0")}`;

  course.id = newId;
});

export default Option;
