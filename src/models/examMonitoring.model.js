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
    },

    switch_tab_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    fullscreen_exit_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    // General metadata: can store counts and arrays of media ids for snapshots
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    // Optional media reference for exam start snapshot
    exam_start_media_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    indexes: [{ fields: ["enrollment_id"] }],
  }
);

ExamMonitoring.beforeCreate((m) => {
  m.id = generateUUID();
});

ExamMonitoring.beforeBulkCreate((items) => {
  items.forEach((i) => {
    i.id = generateUUID();
  });
});

export default ExamMonitoring;
