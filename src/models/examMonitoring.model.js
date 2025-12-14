import { DataTypes } from "sequelize";

import sequelize from "#db/index.js";
import { generateUUID } from "#utils/utils.js";

const ExamMonitoring = sequelize.define(
  "ExamMonitorings",
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

    tab_switch_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    fullscreen_exit_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        snapshots: {
          regular_interval: [], // Array of media IDs
          multiple_face_detection: [], // Array of media IDs
          no_face_detection: [], // Array of media IDs
          exam_start: null, // Single media ID
        },
      },
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
    indexes: [{ fields: ["enrollment_id"] }],
  }
);

ExamMonitoring.beforeCreate((monitoring) => {
  monitoring.id = generateUUID();
  if (!monitoring.metadata) {
    monitoring.metadata = {
      snapshots: {
        regular_interval: [],
        multiple_face_detection: [],
        no_face_detection: [],
        exam_start: null,
      },
    };
  }
});

ExamMonitoring.beforeUpdate((monitoring) => {
  monitoring.updated_at = new Date();
});

export default ExamMonitoring;
