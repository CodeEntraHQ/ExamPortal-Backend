import sequelize from "../db/index.js";

export const getAppHealth = (req, res) => {
  res.status(200).json({ status: 'UP' });
};

export const getDBHealth = async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'UP' });
  } catch (error) {
    res.status(500).json({ status: 'DOWN', error: error.message });
  }
};
