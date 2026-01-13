import Stripe from "stripe";
import { clerkClient } from "@clerk/clerk-sdk-node";
import User from "../models/Users.js";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";
import { CourseProgress } from "../models/CourseProgress.js";



const ensureUser = async (req) => {
  const clerkId = req.auth?.userId;
  if (!clerkId) return null;

  let user = await User.findOne({ clerkId });
  if (user) return user;

  // 🔥 Clerk server se user lao
  const clerkUser = await clerkClient.users.getUser(clerkId);

  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    throw new Error("Email not found from Clerk");
  }

  user = await User.create({
    clerkId,
    name: clerkUser.fullName || "User",
    email,
    imageUrl: clerkUser.imageUrl || "",
    enrolledCourses: [],
  });

  return user;
};


// ====================== GET USER DATA ======================
export const getUserdata = async (req, res) => {
  try {
    const user = await ensureUser(req);
    if (!user) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    return res.json({ success: true, user });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ====================== USER ENROLLED COURSES ======================
export const userEnrolledCourses = async (req, res) => {
  try {
    const user = await ensureUser(req);
    if (!user) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    const populatedUser = await User.findById(user._id).populate(
      "enrolledCourses"
    );

    return res.json({
      success: true,
      enrolledCourses: populatedUser.enrolledCourses,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ====================== PURCHASE COURSE (STRIPE) ======================
export const purchasedCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const user = await ensureUser(req);
    if (!user) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }

    const amount =
      course.coursePrice -
      (course.discount * course.coursePrice) / 100;

    const purchase = await Purchase.create({
      userId: user._id,
      courseId: course._id,
      amount,
      status: "pending",
    });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: process.env.CURRENCY || "inr",
            product_data: {
              name: course.courseTitle,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/loading/my-enrollments`,
      cancel_url: `${process.env.CLIENT_URL}/course/${courseId}`,
      metadata: {
        userId: user._id.toString(),
        courseId: course._id.toString(),
        purchaseId: purchase._id.toString(),
      },
    });

    return res.json({
      success: true,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("PURCHASE ERROR:", error);
    return res.json({ success: false, message: error.message });
  }
};

// ====================== UPDATE USER COURSE PROGRESS ======================
export const updateUserCourseProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.body;

    const user = await ensureUser(req);
    if (!user) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    let progress = await CourseProgress.findOne({
      userId: user._id,
      courseId,
    });

    if (!progress) {
      progress = await CourseProgress.create({
        userId: user._id,
        courseId,
        lectureCompleted: [lectureId],
      });
    } else if (!progress.lectureCompleted.includes(lectureId)) {
      progress.lectureCompleted.push(lectureId);
      await progress.save();
    }

    return res.json({ success: true, message: "Progress updated" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ====================== GET USER COURSE PROGRESS ======================
export const getUserCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.body;

    const user = await ensureUser(req);
    if (!user) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    const progress = await CourseProgress.findOne({
      userId: user._id,
      courseId,
    });

    return res.json({ success: true, progress });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ====================== ADD USER RATING ======================
export const addUserRating = async (req, res) => {
  try {
    const { courseId, rating } = req.body;

    const user = await ensureUser(req);
    if (!user) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.json({ success: false, message: "Invalid rating" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }

    if (!user.enrolledCourses.includes(courseId)) {
      return res.json({
        success: false,
        message: "Purchase course to rate",
      });
    }

    const existing = course.courseRatings.find(
      (r) => String(r.userId) === String(user._id)
    );

    if (existing) {
      existing.rating = rating;
    } else {
      course.courseRatings.push({
        userId: user._id,
        rating,
      });
    }

    await course.save();

    return res.json({
      success: true,
      message: "Rating submitted",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
