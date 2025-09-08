export const getAppHealth = (_req, res) => {
  res.status(200).json({ status: "UP" });
};
