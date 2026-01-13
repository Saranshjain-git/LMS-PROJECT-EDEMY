import Course from "../models/Course.js";

// GET ALL COURSES
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET COURSE BY ID
export const getCourseId = async (req, res) => {
  const { id } = req.params;

  try {
    const courseData = await Course.findById(id);

    if (!courseData) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Hide non-preview lecture URLs
    if (courseData.chapters) {
      courseData.chapters.forEach(chapter => {
        chapter.chapterContent.forEach(lecture => {
          if (!lecture.isPreviewFree) {
            lecture.lectureUrl = "";
          }
        });
      });
    }

    res.status(200).json({
      success: true,
      courseData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
