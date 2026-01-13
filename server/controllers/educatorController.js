import { clerkClient } from "@clerk/express";
import Course from "../models/Course.js";
import { v2 as cloudinary } from "cloudinary";
import { Purchase } from "../models/Purchase.js";

/* ===============================
   UPDATE ROLE TO EDUCATOR
================================ */
export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.auth.userId;

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "educator",
      },
    });

    res.json({ success: true, message: "You can Publish a Course now" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ===============================
   ADD NEW COURSE
================================ */
export const addCourse = async (req, res) => {
  try {
    const courseData = JSON.parse(req.body.data);

    if (!req.file) {
      return res.json({
        success: false,
        message: "Thumbnail not uploaded",
      });
    }

    const course = await Course.create({
      courseTitle: courseData.title,
      courseDescription: courseData.description,
      coursePrice: courseData.price,
      discount: courseData.discount,
      courseContent: courseData.chapters, // 
      courseThumbnail: `/uploads/${req.file.filename}`,
      educator: req.auth.userId,
    });
    

    res.json({
      success: true,
      message: "Course added successfully",
      course,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ===============================
   GET EDUCATOR COURSES (LIST)
================================ */
export const getEducatorCourses = async (req, res) => {
  try {
    const educatorId = req.auth.userId;

    const courses = await Course.find({ educator: educatorId });

    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ===============================
   🔥 GET EDUCATOR COURSE BY ID
   (THIS WAS MISSING)
================================ */
export const getEducatorCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id); // ✅ NO populate

    if (!course) {
      return res.json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({
      success: true,
      course,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};


/* ===============================
   EDUCATOR DASHBOARD DATA
================================ */
export const educatorDashboardData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });

    const totalCourses = courses.length;
    const courseIds = courses.map((c) => c._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    });

    const totalEarnings = purchases.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    res.json({
      success: true,
      dashboardData: {
        totalCourses,
        totalEarnings,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ===============================
   ENROLLED STUDENTS DATA
================================ */
export const getEnrolledStudentData = async (req, res) => {
  try {
    const educator = req.auth.userId;

    const courses = await Course.find({ educator });
    const courseIds = courses.map((c) => c._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    const enrolledStudents = purchases.map((p) => ({
      student: p.userId,
      courseTitle: p.courseId.courseTitle,
    }));

    res.json({ success: true, enrolledStudents });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
