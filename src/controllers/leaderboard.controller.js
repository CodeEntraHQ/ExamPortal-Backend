import sequelize from "../db/index.js";
import User from "../models/user.model.js";
import Result from "../models/result.model.js";

const getLeaderboard = async (req, res) => {
  try {
    const { exam_id, page = 1, limit = 10 } = req.query;
    const user = req.user;

    // ✅ Role check
    if (!["ADMIN", "SUPERADMIN", "STUDENT"].includes(user.role)) {
      return res.status(403).json({
        status: "FAILURE",
        responseMsg: "AUTHENTICATION_FAILED",
      });
    }

    // ✅ Validation
    if (!exam_id) {
      return res.status(400).json({
        status: "FAILURE",
        responseMsg: "exam_id is required",
      });
    }

    // ✅ Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // ✅ Fetch results with User join
    const { count, rows } = await Result.findAndCountAll({
      where: { quiz_id: exam_id },
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
      ],
      order: [["score", "DESC"]], // highest score first
      offset,
      limit: parseInt(limit),
    });

    return res.status(200).json({
      status: "SUCCESS",
      responseMsg: "SCOREBOARD_FETCHED",
      payload: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        scoreboard: rows.map((r) => ({
          user_id: r.user_id,
          name: r.User?.name || "Unknown",
          score: r.score,
        })),
      },
    });
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return res.status(500).json({
      status: "FAILURE",
      responseMsg: "INTERNAL_SERVER_ERROR",
    });
  }
};

export { getLeaderboard };
