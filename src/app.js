import dotenv from "dotenv";
import express from "express";
import cors from "cors";

const app = express();

dotenv.config({
  path: "./.env",
});
const port = process.env.PORT;

import sequelize from "./db/index.js";

// import models
import Course from "./models/courses.model.js";
import User from "./models/user.model.js";
import Quiz from "./models/quizzes.model.js";
import Question from "./models/question.model.js";
import Option from "./models/option.model.js";

// routes import
import userRouter from "./routes/user.route.js";
import allCourses from "./routes/course.route.js";
import quizzesRoute from "./routes/quizzes.route.js";
import questionRoute from "./routes/question.route.js";

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// database relation
User.belongsTo(Course, { foreignKey: "course_id", onDelete: "CASCADE" });
Course.hasMany(User, { foreignKey: "course_id" });
Quiz.belongsTo(Course, { foreignKey: "course_id", onDelete: "CASCADE" });
Question.belongsTo(Quiz, { foreignKey: "quiz_id" });
Quiz.hasMany(Question, { foreignKey: "quiz_id" });

Option.belongsTo(Question, { foreignKey: "question_id" });
Question.hasMany(Option, { foreignKey: "question_id", as: "Options" });

// routes declaration
app.use("/api/v1", allCourses);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/user", quizzesRoute);
app.use("/api/v1/quizze", questionRoute);

app.get("/", (req, res) => {
  res.send("Hello belal World!");
});

sequelize
  .sync()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error Event For App !!", error);
    });
    app.listen(port, () => {
      console.log(`app listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });
