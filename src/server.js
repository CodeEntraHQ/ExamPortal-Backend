import app from "#app.js";
import sequelize from "#db/index.js";
import AdmissionForm from "#models/admissionForm.model.js";
import AdmissionFormSubmission from "#models/admissionFormSubmission.model.js";
import Enrollment from "#models/enrollment.model.js";
// import models
import Entity from "#models/entity.model.js";
import Exam from "#models/exam.model.js";
import ExamMonitoring from "#models/examMonitoring.model.js";
import Question from "#models/question.model.js";
import Result from "#models/result.model.js";
import Submission from "#models/submission.model.js";
import User from "#models/user.model.js";

User.belongsTo(Entity, { foreignKey: "entity_id", onDelete: "CASCADE" });
Exam.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
Question.belongsTo(Exam, { foreignKey: "exam_id", onDelete: "CASCADE" });
Enrollment.belongsTo(Exam, { foreignKey: "exam_id", onDelete: "CASCADE" });
Enrollment.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
Result.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
Result.belongsTo(Exam, { foreignKey: "exam_id", onDelete: "CASCADE" });
Submission.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});
Submission.belongsTo(Exam, {
  foreignKey: "exam_id",
  onDelete: "CASCADE",
});
Submission.belongsTo(Question, {
  foreignKey: "question_id",
  onDelete: "CASCADE",
});
AdmissionForm.belongsTo(Exam, { foreignKey: "exam_id", onDelete: "CASCADE" });
AdmissionFormSubmission.belongsTo(Exam, {
  foreignKey: "exam_id",
  as: "Exam",
  onDelete: "CASCADE",
});
AdmissionFormSubmission.belongsTo(User, {
  foreignKey: "representative_id",
  as: "Representative",
  onDelete: "CASCADE",
});
ExamMonitoring.belongsTo(Enrollment, {
  foreignKey: "enrollment_id",
  onDelete: "CASCADE",
});

const port = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
    await sequelize.sync();
    console.log("All models were synchronized successfully.");

    app.listen(port, () => {
      console.log(`app listening on port ${port}`);
    });
  } catch (error) {
    console.error("Unable to start the server:", error);
    process.exit(1);
  }
};

startServer();
