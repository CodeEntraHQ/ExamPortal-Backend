import onFinished from "on-finished";
import { logInfo } from "#utils/logger.js";

const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  const originalJson = res.json;

  res.send = function (body) {
    res.body = body;
    originalSend.call(this, body);
  };

  res.json = function (body) {
    res.body = body;
    originalJson.call(this, body);
  };

  onFinished(res, () => {
    const latency = Date.now() - startTime;
    const request = {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
    };
    let responseBody = res.body;
    try {
      if (typeof responseBody === "string") {
        responseBody = JSON.parse(responseBody);
      }
    } catch {
      // Ignore parsing errors, keep the original body
    }
    const response = {
      statusCode: res.statusCode,
      body: responseBody,
    };

    logInfo({
      action: "API_REQUEST",
      message: {
        request,
        response,
        latency: `${latency}ms`,
      },
    });
  });

  next();
};

export default loggerMiddleware;
