import winston from "winston";
import asyncLocalStorage from "./context.js";

const logger = winston.createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    storage: 6,
  },
  level: "storage",
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
  const context = asyncLocalStorage.getStore();
  const logObject = {
    level,
    request_id: context?.request_id,
    timestamp: new Date().toISOString(),
    api_name: context?.api_name,
    session_id: context?.session_id,
    user_id: context?.user_id,
    action: params.action,
    message: params.message,
    environment: process.env.NODE_ENV,
  };
  if (logObject.environment != "test") {
    logger.log(level, logObject);
  }
};

const logError = (params) => log("error", params);
const logInfo = (params) => log("info", params);
const logDebug = (params) => log("debug", params);
const logStorage = (params) => log("storage", params);

export { logError, logInfo, logDebug, logStorage };
