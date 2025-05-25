import Course from "../models/courses.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const usersCourses = asyncHandler(async (req, res) => {
  const courses = await Course.findAll();

  // console.log("course>>>>>>>", courses);
  return res
    .status(200)
    .json(new ApiResponse(200, courses ?? [], "Courses fetched successfully"));
});

export { usersCourses };
