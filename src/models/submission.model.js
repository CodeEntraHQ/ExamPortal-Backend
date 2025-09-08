import { DataTypes } from "sequelize";
import sequelize from "#db/index.js";
import { generateUUID } from "#utils/utils.js";

const Submission = sequelize.define(
  "Submission",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.STRING,
      unique: true,
    },

    quiz_id: {
      type: DataTypes.STRING,
      unique: true,
    },

    question_id: {
      type: DataTypes.STRING,
      unique: true,
    },

    metadata: DataTypes.JSON,

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,

    indexes: [
      { fields: ["quiz_id"] },
      { fields: ["user_id"] },
      { fields: ["question_id"] },
    ],
  }
);

Submission.beforeCreate((submission) => {
  submission.id = generateUUID();
});

export default Submission;
