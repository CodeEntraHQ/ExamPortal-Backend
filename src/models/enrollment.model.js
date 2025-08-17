import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

const Enrollment = sequelize.define(
  "Enrollment",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },

    exam_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    metadata: DataTypes.JSON,

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    indexes: [{ fields: ["exam_id"] }, { fields: ["user_id"] }],
  }
);

Enrollment.beforeBulkCreate(async (enrollments) => {
  const existing = await Enrollment.findAll({ attributes: ["id"] });

  const numbers = existing
    .map((c) => parseInt(c.id?.replace("enr", "")))
    .filter((num) => !isNaN(num));

  let maxId = numbers.length ? Math.max(...numbers) : 0;
  enrollments.forEach((enrol) => {
    maxId++;
    enrol.id = `enr${String(maxId).padStart(3, "0")}`;
  });
});

export default Enrollment;
