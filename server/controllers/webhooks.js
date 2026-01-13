import { Webhook } from "svix";
import User from "../models/Users.js";
import Stripe from "stripe";
import "dotenv/config";
import {Purchase} from "../models/Purchase.js";
import Course from "../models/Course.js";

// ===================== CLERK WEBHOOKS =====================
export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOKS_SECRET);

    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        await User.create({
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        });
        break;
      }

      case "user.updated": {
        await User.findOneAndUpdate(
          { clerkId: data.id },
          {
            email: data.email_addresses[0].email_address,
            name: `${data.first_name} ${data.last_name}`,
            imageUrl: data.image_url,
          }
        );
        break;
      }

      case "user.deleted": {
        await User.findOneAndDelete({ clerkId: data.id });
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ===================== STRIPE WEBHOOK =====================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_KEY
    );
  } catch (err) {
    console.error("Stripe webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ PAYMENT SUCCESS (CHECKOUT)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const { userId, courseId, purchaseId } = session.metadata;

    // 1️⃣ Mark purchase as paid
    await Purchase.findByIdAndUpdate(purchaseId, {
      status: "completed",
    });

    // 2️⃣ Enroll user
    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId },
    });

    // 3️⃣ Add student to course
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: userId },
    });
  }

  res.json({ received: true });
};

export default clerkWebhooks;
