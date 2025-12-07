import { DataTypes } from "sequelize";

import sequelize from "#db/index.js";
import { generateUUID } from "#utils/utils.js";

const AdmissionForm = sequelize.define(
  "AdmissionForms",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    exam_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    form_structure: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    public_token: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
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
    indexes: [{ fields: ["exam_id"] }, { fields: ["public_token"] }],
  }
);

// Hook to auto-generate ID using UUID
AdmissionForm.beforeCreate((form) => {
  form.id = generateUUID();
});

// Hook to update updated_at on update
AdmissionForm.beforeUpdate((form) => {
  form.updated_at = new Date();
});

export default AdmissionForm;
