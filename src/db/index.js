import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "postgres",
  process.env.DB_USERNAME || "postgres",
  process.env.DB_PASSWORD || "admin",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: (msg) => {
      if (msg.includes("ERROR")) console.log(msg);
    },
  }
);

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USERNAME,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     dialect: "postgres",
//     define: {
//       schema: process.env.DB_NAME,
//     },
//   }
// );

export default sequelize;
