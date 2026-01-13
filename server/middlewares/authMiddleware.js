import { clerkClient } from "@clerk/express";

// ================= PROTECT USER =================
export const protectUser = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

// ================= PROTECT EDUCATOR =================
export const protectEducator = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const user = await clerkClient.users.getUser(userId);

    if (user.publicMetadata.role !== "educator") {
      return res.json({
        success: false,
        message: "Unauthorized Access",
      });
    }

    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
