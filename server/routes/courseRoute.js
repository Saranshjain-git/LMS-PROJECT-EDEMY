import express from "express";
import {
  getAllCourses,
  getCourseId,
} from "../controllers/courseController.js";

const router = express.Router();

router.get("/", getAllCourses);
router.get("/:id", getCourseId);

export default router;
