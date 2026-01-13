import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/student/Loading'
import { useNavigate } from 'react-router-dom'

const MyCourses = () => {
  const navigate = useNavigate()

  const { currency, backendUrl, getToken } = useContext(AppContext)
  const [courses, setCourses] = useState(null)

  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken()

      const res = await fetch(`${backendUrl}/api/educator/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()
      console.log('My Courses API =>', data)

      if (data.success) {
        setCourses(data.courses)
      } else {
        setCourses([])
      }
    } catch (error) {
      console.error(error)
      setCourses([])
    }
  }

  useEffect(() => {
    fetchEducatorCourses()
  }, [])

  return courses ? (
    <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className="w-full">
        <h2 className="pb-4 text-lg font-medium">My Courses</h2>

        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">All Courses</th>
                <th className="px-4 py-3 font-semibold truncate">Earnings</th>
                <th className="px-4 py-3 font-semibold truncate">Students</th>
                <th className="px-4 py-3 font-semibold truncate">Published On</th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-500">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6">
                    No courses found
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr
                    key={course._id}
                    onClick={() =>
                      navigate(`/educator/course/${course._id}`)
                    }
                    className="border-b border-gray-500/20 cursor-pointer hover:bg-gray-100"
                  >
                    {/* COURSE INFO */}
                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                      <img
                        src={course.courseThumbnail || '/placeholder.png'}
                        alt="Course"
                        className="w-16 h-10 object-cover"
                      />
                      <span className="truncate hidden md:block">
                        {course.courseTitle}
                      </span>
                    </td>

                    {/* EARNINGS */}
                    <td className="px-4 py-3">
                      {currency}
                      {Math.floor(
                        course.enrolledStudents.length *
                          (course.coursePrice -
                            (course.discount * course.coursePrice) / 100)
                      )}
                    </td>

                    {/* STUDENTS */}
                    <td className="px-4 py-3">
                      {course.enrolledStudents.length}
                    </td>

                    {/* DATE */}
                    <td className="px-4 py-3">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default MyCourses
