import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";
import { generateUUID } from "../utils/utils.js";

const College = sequelize.define(
  "College",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
  }
);

College.beforeCreate((college) => {
  college.id = generateUUID();
});

export default College;
