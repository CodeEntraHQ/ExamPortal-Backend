// context middleware
import cors from "cors";
import express from "express";

import contextMiddleware from "#middleware/context.middleware.js";
// error handler middleware
import { errorHandler } from "#middleware/error.middleware.js";
// logger middleware
import loggerMiddleware from "#middleware/logger.middleware.js";
import getAllCollege from "#routes/college.route.js";
import examAndQuestRouter from "#routes/exam.route.js";
import healthcheckRouter from "#routes/healthcheck.route.js";
// routes import
import userRouter from "#routes/user.route.js";

const app = express();

// Disable ETag generation
app.disable("etag");

app.use(
  cors({
    origin: process.env.FRONTEND_HOST,
    credentials: true,
  })
);

// middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(contextMiddleware);

app.use(loggerMiddleware);

// routes declaration
app.use("/v1/colleges", getAllCollege);
app.use("/v1/users", userRouter);
app.use("/v1/exams", examAndQuestRouter);
app.use("/v1/checks", healthcheckRouter);

app.use(errorHandler);

// export app for testing
export default app;
