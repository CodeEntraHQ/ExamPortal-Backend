import { v4 as uuidv4 } from "uuid";
import asyncLocalStorage from "../utils/context.js";

const contextMiddleware = (req, res, next) => {
  const store = {
    request_id: uuidv4(),
    api_name: `${req.method}-${req.originalUrl}`,
    session_id: req.session ? req.session.id : uuidv4(),
    user_id: req.user ? req.user.id : null,
  };

  asyncLocalStorage.run(store, () => {
    next();
  });
};

export default contextMiddleware;
