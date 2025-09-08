import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

const Submission = sequelize.define(
  "Submission",
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

    question_id: {
      type: DataTypes.STRING,
      unique: true,
    },

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
      { unique: true, fields: ["user_id", "quiz_id", "question_id"] },
    ],
  }
);

Submission.beforeBulkCreate(async (submiss) => {
  const existing = await Submission.findAll({ attributes: ["id"] });
  const numbers = existing
    .map((c) => parseInt(c.id?.replace("sub", "")))
    .filter((num) => !isNaN(num));

  let maxId = numbers.length ? Math.max(...numbers) : 0;
  submiss.forEach((subm) => {
    maxId++;
    subm.id = `sub${String(maxId).padStart(3, "0")}`;
  });
});

export default Submission;
