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

Enrollment.beforeCreate(async (enrol) => {
  const enrolment = await Enrollment.findAll({ attributes: ["id"] });

  const numbers = enrolment
    .map((c) => parseInt(c.id?.replace("enr", "")))
    .filter((num) => !isNaN(num));

  const maxId = numbers.length ? Math.max(...numbers) : 0;
  const newId = `enr${String(maxId + 1).padStart(3, "0")}`;

  enrol.id = newId;
});

export default Enrollment;
