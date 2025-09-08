import { Sequelize } from "sequelize";
import { logStorage } from "#utils/logger.js";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: (msg, executionTime) => {
      const query = msg.replace(/^Executed \(default\):\s*/, "");
      logStorage({
        action: query.split(" ")[0],
        message: {
          query,
          latency: executionTime, // In ms
        },
      });
    },
    benchmark: true, // enable benchmarking to get execution time
  }
);

export default sequelize;
