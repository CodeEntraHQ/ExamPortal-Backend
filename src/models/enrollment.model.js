import { DataTypes } from "sequelize";

import sequelize from "#db/index.js";
import { ENROLLMENT_STATUS } from "#utils/constants/model.constant.js";
import { generateUUID } from "#utils/utils.js";

const Enrollment = sequelize.define(
  "Enrollments",
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

    status: {
      type: DataTypes.ENUM(...Object.values(ENROLLMENT_STATUS)),
      allowNull: true,
      defaultValue: null,
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

Enrollment.beforeCreate((enrollment) => {
  enrollment.id = generateUUID();
});

Enrollment.beforeBulkCreate((enrollments) => {
  enrollments.forEach((enrollment) => {
    enrollment.id = generateUUID();
  });
});

export default Enrollment;
