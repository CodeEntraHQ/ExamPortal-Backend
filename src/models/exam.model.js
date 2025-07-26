import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

const Exam = sequelize.define(
  "Exam",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    metadata: DataTypes.JSON,
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    entity_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("QUIZ", "OTHER"),
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    indexes: [{ fields: ["user_id"] }],
  }
);

// Hook to auto-generate ID like ex001, ex002...
Exam.beforeCreate(async (exam) => {
  const exams = await Exam.findAll({ attributes: ["id"] });

  const numbers = exams
    .map((c) => parseInt(c.id?.replace("exa", "")))
    .filter((num) => !isNaN(num));

  const maxId = numbers.length ? Math.max(...numbers) : 0;
  const newId = `exa${String(maxId + 1).padStart(3, "0")}`;

  exam.id = newId;
});

export default Exam;
