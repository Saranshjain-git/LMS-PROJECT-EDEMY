import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";

const EducatorCourseDetail = () => {
  const { id } = useParams();
  const { backendUrl, currency } = useContext(AppContext);

  const [course, setCourse] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const fetchCourse = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/course/${id}`);
      const data = await res.json();

      if (data.success) {
        setCourse(data.courseData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  if (!course) return <Loading />;

  const chapters = course.chapters || course.courseContent || [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="grid md:grid-cols-2 gap-8">
        <img
          src={course.courseThumbnail || "/placeholder.png"}
          alt="Course"
          className="rounded-lg w-full h-64 object-cover border"
        />

        <div>
          <h1 className="text-3xl font-bold mb-2">
            {course.courseTitle}
          </h1>

          <div
            className="text-gray-600 mb-4"
            dangerouslySetInnerHTML={{
              __html: course.courseDescription,
            }}
          />

          <div className="flex items-center gap-4 mb-4">
            <span className="text-2xl font-bold text-green-600">
              {currency}
              {course.coursePrice -
                (course.discount * course.coursePrice) / 100}
            </span>

            {course.discount > 0 && (
              <>
                <span className="line-through text-gray-400">
                  {currency}
                  {course.coursePrice}
                </span>
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">
                  {course.discount}% OFF
                </span>
              </>
            )}
          </div>

          <button className="bg-black text-white px-6 py-2 rounded">
            Purchase Course
          </button>
        </div>
      </div>

      {/* PREVIEW */}
      {previewUrl && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2">
            Preview Lecture
          </h2>
          <iframe
            src={previewUrl}
            title="Preview"
            className="w-full h-96 rounded border"
            allowFullScreen
          />
        </div>
      )}

      {/* COURSE CONTENT */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">
          Course Content
        </h2>

        {chapters.length === 0 && (
          <p className="text-gray-500">
            No chapters added yet
          </p>
        )}

        {chapters.map((chapter, i) => (
          <div
            key={i}
            className="border rounded mb-4 overflow-hidden"
          >
            <div className="bg-gray-100 px-4 py-2 font-semibold">
              {chapter.chapterTitle}
            </div>

            <div className="divide-y">
              {(chapter.chapterContent || []).map((lec, j) => (
                <div
                  key={j}
                  className="px-4 py-2 flex justify-between items-center"
                >
                  <span>
                    {lec.lectureTitle} ({lec.lectureDuration} min)
                  </span>

                  {lec.isPreviewFree ? (
                    <button
                      onClick={() => setPreviewUrl(lec.lectureUrl)}
                      className="text-blue-500 text-sm"
                    >
                      Preview
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      Locked
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducatorCourseDetail;
