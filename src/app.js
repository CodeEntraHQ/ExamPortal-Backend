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
import Collage from "./models/collage.model.js";
import User from "./models/user.model.js";
import Exam from "./models/exam.model.js";
import Question from "./models/question.model.js";
import Enrollment from "./models/enrollment.model.js";
import Result from "./models/result.model.js";
import Submission from "./models/submission.model.js";

// routes import
import userRouter from "./routes/user.route.js";
import getAllCollage from "./routes/collage.route.js";
import examAndQuestRouter from "./routes/exam.route.js";
// import questionRoute from "./routes/question.route.js";

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
User.belongsTo(Collage, { foreignKey: "entity_id", onDelete: "CASCADE" });
Exam.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
Question.belongsTo(Exam, { foreignKey: "exam_id", onDelete: "CASCADE" });
Enrollment.belongsTo(Exam, { foreignKey: "exam_id", onDelete: "CASCADE" });
Enrollment.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
Result.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
Result.belongsTo(Exam, { foreignKey: "quiz_id", onDelete: "CASCADE" });
Submission.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});
Submission.belongsTo(Exam, {
  foreignKey: "quiz_id",
  onDelete: "CASCADE",
});
Submission.belongsTo(Question, {
  foreignKey: "question_id",
  onDelete: "CASCADE",
});

// routes declaration
app.use("/v1", getAllCollage);
app.use("/v1/users", userRouter);
app.use("/v1/exam", examAndQuestRouter);

sequelize
  .sync()
  // .sync({ force: true })
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
