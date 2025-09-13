import { DataTypes } from "sequelize";

import sequelize from "#db/index.js";
import { EXAM_TYPE } from "#utils/constants/model.constant.js";
import { generateUUID } from "#utils/utils.js";

const Exam = sequelize.define(
  "Exams",
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
      type: DataTypes.ENUM(EXAM_TYPE.QUIZ, EXAM_TYPE.OTHER),
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

// Hook to auto-generate ID using UUID
Exam.beforeCreate((exam) => {
  exam.id = generateUUID();
});

export default Exam;
