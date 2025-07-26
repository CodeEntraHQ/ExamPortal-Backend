import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

const Result = sequelize.define(
  "Result",
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

    score: DataTypes.INTEGER,

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
      { fields: ["score"] },
    ],
  }
);

Result.beforeCreate(async (result) => {
  const results = await Result.findAll({ attributes: ["id"] });

  const numbers = results
    .map((c) => parseInt(c.id?.replace("res", "")))
    .filter((num) => !isNaN(num));

  const maxId = numbers.length ? Math.max(...numbers) : 0;
  const newId = `res${String(maxId + 1).padStart(3, "0")}`;

  result.id = newId;
});

export default Result;
