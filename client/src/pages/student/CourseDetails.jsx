import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import Footer from "../../components/student/Footer";
import axios from "axios";
import { toast } from "react-toastify";
import { getCourseImage } from "../../utils/courseImage";

const CourseDetails = () => {
  const { id } = useParams();
  const { backendUrl, currency } = useContext(AppContext);

  const [courseData, setCourseData] = useState(null);
  const [openChapters, setOpenChapters] = useState({});

  // 🔹 Fetch course
  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/client/courses/${id}`
      );

      if (!courseData) return <Loading />;

      console.log("THUMBNAIL PATH =>", courseData.courseThumbnail);


      console.log("COURSE DATA =>", data);

      if (data.success) {
        setCourseData(data.course);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, []);

  if (!courseData) return <Loading />;

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT SECTION */}
        <div className="lg:col-span-2 space-y-6">

          {/* Thumbnail */}
          <img
            src={getCourseImage(courseData.courseThumbnail)}
            alt={courseData.courseTitle}
            className="w-full h-[350px] object-cover rounded-xl"
          />


          {/* COURSE CONTENT */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-4">Course Content</h2>

            {courseData.courseContent &&
              courseData.courseContent.length > 0 ? (
              <div className="space-y-4">
                {courseData.courseContent.map((chapter, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4"
                  >
                    <button
                      className="w-full flex justify-between font-medium"
                      onClick={() =>
                        setOpenChapters((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }))
                      }
                    >
                      <span>{chapter.chapterTitle}</span>
                      <span>{openChapters[index] ? "−" : "+"}</span>
                    </button>

                    {openChapters[index] && (
                      <ul className="mt-3 space-y-2 text-sm text-gray-600">
                        {chapter.lectures.map((lec, i) => (
                          <li
                            key={i}
                            className="flex justify-between"
                          >
                            <span>{lec.lectureTitle}</span>
                            {lec.isPreviewFree && (
                              <span className="text-green-600">
                                Free
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No chapters added yet
              </p>
            )}
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="bg-white rounded-2xl shadow-lg p-6 h-fit space-y-4">
          <h1 className="text-2xl font-bold">
            {courseData.courseTitle}
          </h1>

          <p className="text-gray-600 text-sm">
            {courseData.courseDescription}
          </p>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-green-600">
              {currency}
              {courseData.coursePrice}
            </span>

            {courseData.discount > 0 && (
              <span className="line-through text-gray-400">
                {currency}
                {Math.round(
                  courseData.coursePrice +
                  (courseData.coursePrice *
                    courseData.discount) /
                  100
                )}
              </span>
            )}
          </div>

          <button className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800">
            Purchase Course
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CourseDetails;
