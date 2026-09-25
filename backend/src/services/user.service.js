import prisma from "../config/prisma.js";
import redis from "../config/redis.js";

/**
 * Get all users except the given user, enriched with their online status and lastSeen timestamp.
 * Priority for lastSeen: Redis (fast) → DB lastSeenAt (persistent fallback)
 * @param {string} currentUserId
 */
export const getAllUsersWithOnlineStatus = async (currentUserId) => {
  const users = await prisma.user.findMany({
    where: { id: { not: currentUserId } },
    select: { id: true, username: true, email: true, avatar: true, lastSeenAt: true },
    orderBy: { username: "asc" },
  });

  // Count unread messages per sender in a single efficient query
  const unreadGroups = await prisma.message.groupBy({
    by: ["senderId"],
    where: {
      receiverId: currentUserId,
      status: { in: ["SENT", "DELIVERED"] },
    },
    _count: { id: true },
  });

  // Build a fast lookup map: senderId -> unread count
  const unreadMap = {};
  unreadGroups.forEach((g) => { unreadMap[g.senderId] = g._count.id; });

  const enriched = await Promise.all(
    users.map(async (user) => {
      let isOnline = false;
      let lastSeen = null;

      try {
        if (redis && redis.status === "ready") {
          isOnline = (await redis.sismember("online_users", user.id)) === 1;
          if (!isOnline) {
            // Try Redis cache first (fast)
            lastSeen = await redis.get(`lastSeen:${user.id}`);
          }
        }
      } catch (redisErr) {
        console.warn(`[UserService] Redis check failed for userId "${user.id}":`, redisErr.message);
      }

      // Fall back to DB value if Redis had nothing
      if (!isOnline && !lastSeen && user.lastSeenAt) {
        lastSeen = user.lastSeenAt.toISOString();
      }

      return { ...user, isOnline, lastSeen, unreadCount: unreadMap[user.id] || 0 };
    })
  );

  return enriched;
};
