import express from "express";
import {
  addUserRating,
  getUserCourseProgress,
  getUserdata,
  purchasedCourse,
  updateUserCourseProgress,
  userEnrolledCourses,
} from "../controllers/userController.js";

const userRouter = express.Router();

// Clerk already handled globally
userRouter.get("/data", getUserdata);
userRouter.get("/enrolled-courses", userEnrolledCourses);

// 🔥 FIX HERE (remove protectUser)
userRouter.post("/purchase-course", purchasedCourse);

userRouter.post("/update-course-progress", updateUserCourseProgress);
userRouter.post("/get-course-progress", getUserCourseProgress);
userRouter.post("/add-rating", addUserRating);

export default userRouter;
