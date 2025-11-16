import { DataTypes } from "sequelize";

import sequelize from "#db/index.js";
import { SUBMISSION_STATUS } from "#utils/constants/model.constant.js";
import { generateUUID } from "#utils/utils.js";

const AdmissionFormSubmission = sequelize.define(
  "AdmissionFormSubmissions",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    exam_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    representative_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    form_responses: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SUBMISSION_STATUS)),
      allowNull: false,
      defaultValue: SUBMISSION_STATUS.PENDING,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    indexes: [
      { fields: ["exam_id"] },
      { fields: ["representative_id"] },
      { fields: ["status"] },
    ],
  }
);

// Hook to auto-generate ID using UUID
AdmissionFormSubmission.beforeCreate((submission) => {
  submission.id = generateUUID();
});

// Hook to update updated_at on update
AdmissionFormSubmission.beforeUpdate((submission) => {
  submission.updated_at = new Date();
});

export default AdmissionFormSubmission;
