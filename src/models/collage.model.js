import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

const Collage = sequelize.define(
  "Collage",
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

Collage.beforeCreate(async (collage) => {
  const collageId = await Collage.findAll({ attributes: ["id"] });

  const numbers = collageId
    .map((c) => parseInt(c.id?.replace("col", "")))
    .filter((num) => !isNaN(num));

  const maxId = numbers.length ? Math.max(...numbers) : 0;
  const newId = `col${String(maxId + 1).padStart(3, "0")}`;

  collage.id = newId;
});

export default Collage;
