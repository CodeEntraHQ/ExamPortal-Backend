import { Router } from "express";
import multer from "multer";

import { createExam } from "#controllers/exams/createExam.controller.js";
import { createQuestion } from "#controllers/exams/createQuestion.controller.js";
import { deleteExamEnrollment } from "#controllers/exams/deleteExamEnrollment.controller.js";
import { deleteQuestion } from "#controllers/exams/deleteQuestion.controller.js";
import { getExamById } from "#controllers/exams/getExamById.controller.js";
import { getExamDetailStatistics } from "#controllers/exams/getExamDetailStatistics.controller.js";
import { getExamEnrollments } from "#controllers/exams/getExamEnrollments.controller.js";
import { getExamLeaderboard } from "#controllers/exams/getExamLeaderboard.controller.js";
import { getExamPerformance } from "#controllers/exams/getExamPerformance.controller.js";
import { getExamScoreDistribution } from "#controllers/exams/getExamScoreDistribution.controller.js";
import { getExamStatistics } from "#controllers/exams/getExamStatistics.controller.js";
import { getExamTypeDistribution } from "#controllers/exams/getExamTypeDistribution.controller.js";
import { getExams } from "#controllers/exams/getExams.controller.js";
import { getQuestions } from "#controllers/exams/getQuestions.controller.js";
import { getRepresentativeEnrollments } from "#controllers/exams/getRepresentativeEnrollments.controller.js";
import { getScoreDistribution } from "#controllers/exams/getScoreDistribution.controller.js";
import { getStudentEnrollments } from "#controllers/exams/getStudentEnrollments.controller.js";
import { inviteRepresentatives } from "#controllers/exams/inviteRepresentatives.controller.js";
import { inviteStudent } from "#controllers/exams/inviteStudents.controller.js";
import { updateExam } from "#controllers/exams/updateExam.controller.js";
import { updateQuestion } from "#controllers/exams/updateQuestion.controller.js";
import { verifyJWT } from "#middleware/authentication.middleware.js";
import { checkAuthorization } from "#middleware/authorization.middleware.js";
import { validate } from "#middleware/validation.middleware.js";
import { USER_ROLES } from "#utils/constants/model.constant.js";
import {
  createExamSchema,
  updateExamSchema,
  getExamsSchema,
  getExamByIdSchema,
  getExamStatisticsSchema,
  getExamEnrollmentsSchema,
  getExamDetailStatisticsSchema,
  getExamLeaderboardSchema,
  deleteExamEnrollmentSchema,
  createQuestionSchema,
  updateQuestionSchema,
  deleteQuestionSchema,
  getQuestionsSchema,
  inviteStudentSchema,
  inviteRepresentativesSchema,
  getStudentEnrollmentsSchema,
  getRepresentativeEnrollmentsSchema,
} from "#validations/exam.validation.js";

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5242880, // 5MB limit
  },
});

router
  .route("/")
  .post(
    validate(createExamSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    createExam
  );

router.route("/").get(validate(getExamsSchema), verifyJWT, getExams);

// Specific routes must come before parameterized routes to avoid route conflicts
router
  .route("/statistics")
  .get(
    validate(getExamStatisticsSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    getExamStatistics
  );

router
  .route("/type-distribution")
  .get(
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    getExamTypeDistribution
  );

router
  .route("/score-distribution")
  .get(
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    getScoreDistribution
  );

router
  .route("/performance")
  .get(
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    getExamPerformance
  );

router
  .route("/enrollments")
  .get(
    validate(getStudentEnrollmentsSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.STUDENT),
    getStudentEnrollments
  );

router
  .route("/representative/enrollments")
  .get(
    validate(getRepresentativeEnrollmentsSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.REPRESENTATIVE),
    getRepresentativeEnrollments
  );

router
  .route("/:id/invite")
  .post(
    validate(inviteStudentSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    inviteStudent
  );

router
  .route("/:exam_id/invite-representatives")
  .post(
    validate(inviteRepresentativesSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    inviteRepresentatives
  );

router
  .route("/:id/enrollments")
  .get(
    validate(getExamEnrollmentsSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    getExamEnrollments
  );

router
  .route("/:id/enrollments/:enrollmentId")
  .delete(
    validate(deleteExamEnrollmentSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    deleteExamEnrollment
  );

router.route("/question").post(
  upload.fields([
    { name: "question_image", maxCount: 1 },
    { name: "option_images", maxCount: 10 },
  ]),
  validate(createQuestionSchema),
  verifyJWT,
  checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  createQuestion
);

router
  .route("/question")
  .get(validate(getQuestionsSchema), verifyJWT, getQuestions);

router
  .route("/question/:id")
  .patch(
    upload.fields([
      { name: "question_image", maxCount: 1 },
      { name: "option_images", maxCount: 10 },
    ]),
    validate(updateQuestionSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    updateQuestion
  )
  .delete(
    validate(deleteQuestionSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    deleteQuestion
  );

// Parameterized routes should come last
router
  .route("/:id/statistics")
  .get(
    validate(getExamDetailStatisticsSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    getExamDetailStatistics
  );

router
  .route("/:id/score-distribution")
  .get(
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    getExamScoreDistribution
  );

router
  .route("/:id/leaderboard")
  .get(
    validate(getExamLeaderboardSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    getExamLeaderboard
  );

router
  .route("/:id")
  .get(validate(getExamByIdSchema), verifyJWT, getExamById)
  .patch(
    validate(updateExamSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    updateExam
  );

export default router;
