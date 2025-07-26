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
      { fields: ["question_id"] },
    ],
  }
);

Submission.beforeCreate(async (sub) => {
  const submit = await Submission.findAll({ attributes: ["id"] });

  const numbers = submit
    .map((c) => parseInt(c.id?.replace("sub", "")))
    .filter((num) => !isNaN(num));

  const maxId = numbers.length ? Math.max(...numbers) : 0;
  const newId = `sub${String(maxId + 1).padStart(3, "0")}`;

  sub.id = newId;
});

export default Submission;
