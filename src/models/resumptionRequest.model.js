import { DataTypes } from "sequelize";

import sequelize from "#db/index.js";
import { generateUUID } from "#utils/utils.js";

const RESUMPTION_REQUEST_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

const ResumptionRequest = sequelize.define(
  "ResumptionRequests",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },

    enrollment_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Enrollments",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    status: {
      type: DataTypes.ENUM(...Object.values(RESUMPTION_REQUEST_STATUS)),
      allowNull: false,
      defaultValue: RESUMPTION_REQUEST_STATUS.PENDING,
    },

    requested_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },

    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    rejected_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    rejection_reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    approved_by: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    timestamps: false,
    indexes: [
      { fields: ["enrollment_id"] },
      { fields: ["status"] },
      { fields: ["requested_at"] },
    ],
  }
);

ResumptionRequest.beforeCreate((request) => {
  request.id = generateUUID();
});

export { RESUMPTION_REQUEST_STATUS };
export default ResumptionRequest;
