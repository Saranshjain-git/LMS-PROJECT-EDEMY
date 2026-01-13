import express from "express";
import {
  addCourse,
  educatorDashboardData,
  getEducatorCourses,
  getEnrolledStudentData,
  updateRoleToEducator,
  getEducatorCourseById,   // ✅ ADD THIS
} from "../controllers/educatorController.js";

import upload from "../configs/multer.js";
import { protectEducator } from "../middlewares/authMiddleware.js";

const educatorRouter = express.Router();

/* ===============================
   UPDATE ROLE
================================ */
educatorRouter.get("/update-role", updateRoleToEducator);

/* ===============================
   ADD COURSE
================================ */
educatorRouter.post(
  "/add-course",
  protectEducator,          // ✅ auth FIRST
  upload.single("thumbnail"),
  addCourse
);

/* ===============================
   GET ALL COURSES (EDUCATOR)
================================ */
educatorRouter.get("/courses", protectEducator, getEducatorCourses);

/* ===============================
   🔥 GET SINGLE COURSE BY ID
================================ */
educatorRouter.get(
  "/course/:id",
  protectEducator,
  getEducatorCourseById
);

/* ===============================
   DASHBOARD
================================ */
educatorRouter.get(
  "/dashboard",
  protectEducator,
  educatorDashboardData
);

/* ===============================
   ENROLLED STUDENTS
================================ */
educatorRouter.get(
  "/enrolled-students",
  protectEducator,
  getEnrolledStudentData
);

export default educatorRouter;
