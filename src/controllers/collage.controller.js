// import sequelize from "../db/index.js";
import Collage from "../models/collage.model.js";
import sequelize from "../db/index.js";

// const generateColleges = (count = 100) => {
//   const colleges = [];

//   for (let i = 1; i <= count; i++) {
//     const name = `College of ${
//       ["Science", "Tech", "Arts", "Engineering", "Business"][i % 5]
//     } #${i}`;
//     const address = `Block ${String.fromCharCode(
//       65 + (i % 26)
//     )}-${i} Road, City ${i}`;
//     colleges.push({ name, address });
//   }

//   return colleges;
// };

// const insertColleges = async () => {
//   try {
//     await sequelize.sync(); // ensure tables exist
//     const data = generateColleges(120);
//     for (const item of data) {
//       await Collage.create(item);
//     }
//     console.log("Colleges inserted successfully");
//     process.exit(0);
//   } catch (err) {
//     console.error("Error inserting colleges:", err);
//     process.exit(1);
//   }
// };

// insertColleges();

const onboardColleges = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, address } = req.body;

    if (
      [name, address].some((field) => !field || String(field).trim() === "")
    ) {
      return res.status(409).json({
        status: "failure",
        responseMsg: "All fields are required",
      });
    }

    // Check if email exists
    const existingCollage = await Collage.findOne({ where: { name } });
    if (existingCollage) {
      return res.status(409).json({
        status: "failure",
        responseMsg: "Collage Already Exists",
      });
    }

    if (req.user.role === "SUPERADMIN") {
      // Create user
      const collage = await Collage.create({
        name,
        address,
      });

      await t.commit();

      return res.status(201).json({
        status: "Success",
        responseMsg: "COLLEGE_ONBOARDED",
        payload: {
          user: {
            id: collage.id,
            name: collage.name,
            address: collage.address,
          },
        },
      });
    } else {
      await t.rollback();
      return res.status(401).json({
        status: "FAILURE",
        responseMsg: "Unauthorized request",
      });
    }
  } catch (error) {
    // console.error("Register error:", error);
    await t.rollback();
    return res.status(500).json({
      status: "Failure",
      responseMsg: "Internal server Error",
    });
  }
};

const getColleges = async (req, res) => {
  try {
    // console.log("req.query>>>>>", req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: colleges, count: total } = await Collage.findAndCountAll({
      offset,
      limit,
      attributes: ["id", "name", "address"],
      order: [["created_at", "ASC"]],
    });

    if (req.user.role === "SUPERADMIN") {
      return res.json({
        status: "SUCCESS",
        responseMsg: "COLLEGES_FETCHED",
        payload: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          colleges,
        },
      });
    } else {
      return res.status(401).json({
        status: "FAILURE",
        responseMsg: "Unauthorized request",
      });
    }
  } catch (error) {
    // console.error(error);
    return res.status(500).json({
      status: "FAILURE",
      responseMsg: "INTERNAL_SERVER_ERROR",
    });
  }
};

export { onboardColleges, getColleges };
