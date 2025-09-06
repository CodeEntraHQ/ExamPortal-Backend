import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

const College = sequelize.define(
  "College",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
  }
);

College.beforeCreate(async (college) => {
  const collegeId = await College.findAll({ attributes: ["id"] });

  const numbers = collegeId
    .map((c) => parseInt(c.id?.replace("col", "")))
    .filter((num) => !isNaN(num));

  const maxId = numbers.length ? Math.max(...numbers) : 0;
  const newId = `col${String(maxId + 1).padStart(3, "0")}`;

  college.id = newId;
});

export default College;
