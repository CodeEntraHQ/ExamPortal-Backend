import winston from "winston";

import asyncLocalStorage from "./context.js";

const myLevels = {
  levels: {
    error: 0,
    storage: 1,
    info: 2,
    debug: 3,
  },
  colors: {
    error: "red",
    storage: "blue",
    info: "green",
    debug: "yellow",
  },
};

winston.addColors(myLevels.colors);

const logger = winston.createLogger({
  levels: myLevels.levels,
  level: process.env.LOG_LEVEL,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp()
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
    action: params.action,
    message: params.message,
    environment: process.env.NODE_ENV,
  };
  if (process.env.NODE_ENV !== "test") {
    logger.log(level, logObject);
  }
};

const logError = (params) => log("error", params);
const logStorage = (params) => log("storage", params);
const logInfo = (params) => log("info", params);
const logDebug = (params) => log("debug", params);

export { logError, logInfo, logDebug, logStorage };
