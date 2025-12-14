// context middleware
import cors from "cors";
import express from "express";

import contextMiddleware from "#middleware/context.middleware.js";
// error handler middleware
import { errorHandler } from "#middleware/error.middleware.js";
// logger middleware
import loggerMiddleware from "#middleware/logger.middleware.js";
import admissionFormRouter from "#routes/admissionForm.route.js";
import getAllEntity from "#routes/entity.route.js";
import examAndQuestRouter from "#routes/exam.route.js";
import examMonitoringRouter from "#routes/examMonitoring.route.js";
import healthcheckRouter from "#routes/healthcheck.route.js";
import mediaRouter from "#routes/media.route.js";
import submissionRouter from "#routes/submission.route.js";
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
app.use("/v1/entities", getAllEntity);
app.use("/v1/users", userRouter);
app.use("/v1/exams", examAndQuestRouter);
app.use("/v1/admission-forms", admissionFormRouter);
app.use("/v1/submissions", submissionRouter);
app.use("/v1/checks", healthcheckRouter);
app.use("/v1/medias", mediaRouter);
app.use("/v1/exam-monitorings", examMonitoringRouter);

app.use(errorHandler);

// export app for testing
export default app;
