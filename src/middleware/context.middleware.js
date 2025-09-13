import jwt from "jsonwebtoken";

import asyncLocalStorage from "#utils/context.js";
import { generateUUID } from "#utils/utils.js";

const contextMiddleware = (req, res, next) => {
  const store = {
    request_id: req.headers["x-request-id"] || generateUUID(),
    api_name: `${req.method}-${req.originalUrl}`,
  };

  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (token) {
    store.session_id = jwt.decode(token)?.session_id;
  }

  if (!store.session_id) {
    store.session_id = req.headers["x-session-id"] || generateUUID();
  }

  asyncLocalStorage.run(store, () => {
    next();
  });
};

export default contextMiddleware;
