// models/User.js
import { DataTypes } from "sequelize";

import sequelize from "#db/index.js";
import { generateUUID } from "#utils/utils.js";

const Media = sequelize.define(
  "Medias",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },

    media: {
      type: DataTypes.BLOB("long"),
    },
  },
  {
    timestamps: false,
  }
);

// Hook to auto-generate ID using UUID
Media.beforeCreate((media) => {
  media.id = generateUUID();
});

export default Media;
