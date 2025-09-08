import sequelize from "../../db/index.js";

export const getDBHealth = async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: "UP" });
  } catch {
    res.status(500).json({ status: "DOWN" });
  }
};
