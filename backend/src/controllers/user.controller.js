import { getAllUsersWithOnlineStatus } from "../services/user.service.js";

/**
 * GET /api/users
 * Get all users except the current user (for building contact list)
 */
export const getAllUsers = async (req, res) => {
  try {
    console.log(`👥 [GetAllUsers] Fetching contacts for userId: "${req.userId}"`);

    const enriched = await getAllUsersWithOnlineStatus(req.userId);

    const onlineCount = enriched.filter((u) => u.isOnline).length;
    console.log(`✅ [GetAllUsers] Returning ${enriched.length} contacts (${onlineCount} online)`);
    res.json(enriched);
  } catch (err) {
    console.error("❌ [GetAllUsers] Error:", err.message, err.stack);
    res.status(500).json({ message: "Server error" });
  }
};
