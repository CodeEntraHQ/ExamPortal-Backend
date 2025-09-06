const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
});

const log = (level, params) => {
  const logObject = {
    level,
    request_id: params.request_id,
    timestamp: new Date().toISOString(),
    api_name: params.api_name,
    session_id: params.session_id,
    user_id: params.user_id,
    action: params.action,
    environment: process.env.NODE_ENV,
  };
  logger.log(level, logObject);
};

const logInfo = (params) => log("info", params);
const logDebug = (params) => log("debug", params);
const logDB = (params) => log("db", params);

module.exports = {
  logInfo,
  logDebug,
  logDB,
};
