import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_HOST,
    credentials: true,
  })
);

// middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// routes import
import userRouter from "./routes/user.route.js";
import getAllCollege from "./routes/college.route.js";
import examAndQuestRouter from "./routes/exam.route.js";
import healthcheckRouter from './routes/healthcheck.route.js';

// routes declaration
app.use("/v1", getAllCollege);
app.use("/v1/users", userRouter);
app.use("/v1/exam", examAndQuestRouter);
app.use("/v1/checks", healthcheckRouter);

// export app for testing
export default app;
