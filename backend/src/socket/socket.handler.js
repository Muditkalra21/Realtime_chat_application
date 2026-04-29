import redis from "../config/redis.js";
import prisma from "../config/prisma.js";
import { updateMessageStatus, markConversationAsSeen } from "../services/message.service.js";

// Map of userId -> socketId for quick lookup
const userSocketMap = {};

/**
 * Register all Socket.IO event handlers
 * @param {import("socket.io").Server} io
 */
const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (!userId) {
      console.warn(`⚠️  [Socket] Connection rejected — no userId in query (socketId: "${socket.id}")`);
      socket.disconnect();
      return;
    }

    console.log(`🔌 [Socket] Connected — userId: "${userId}", socketId: "${socket.id}"`);

    // --- Online Presence ---
    userSocketMap[userId] = socket.id;

    // Add to Redis online set
    (async () => {
      try {
        if (redis && redis.status === "ready") {
          await redis.sadd("online_users", userId);
          console.log(`⚡ [Socket] Added "${userId}" to Redis online_users set`);
        } else {
          console.warn(`[Socket] Redis not ready (status: "${redis?.status}") — skipping online_users update`);
        }
      } catch (err) {
        console.error(`[Socket] Redis SADD error for "${userId}":`, err.message);
      }
    })();

    // Broadcast updated online users list
    const onlineList = Object.keys(userSocketMap);
    console.log(`[Socket] Broadcasting ${onlineList.length} online user(s): [${onlineList.join(", ")}]`);
    io.emit("getOnlineUsers", onlineList);

    // --- Direct Messaging ---
    socket.on("sendMessage", async ({ receiverId, message }) => {
      const receiverSocketId = userSocketMap[receiverId];

      if (receiverSocketId) {
        // Receiver is online — upgrade status to DELIVERED immediately
        console.log(`📨 [Socket] sendMessage from "${userId}" → "${receiverId}" (messageId: "${message?.id}")`);

        try {
          const updated = await updateMessageStatus(message.id, "DELIVERED");

          // Send the message to the receiver with DELIVERED status
          io.to(receiverSocketId).emit("receiveMessage", { ...message, status: "DELIVERED" });

          // Notify the sender that the message was delivered
          socket.emit("messageStatusUpdated", { messageId: updated.id, status: "DELIVERED" });

          console.log(`✅ [Socket] Message "${message.id}" marked DELIVERED`);
        } catch (err) {
          console.error(`[Socket] Failed to update DELIVERED status for "${message.id}":`, err.message);
          // Still deliver the message even if DB update failed
          io.to(receiverSocketId).emit("receiveMessage", message);
        }
      } else {
        // Receiver is offline — message stays SENT
        console.warn(`[Socket] sendMessage: receiver "${receiverId}" not online — status remains SENT`);
      }
    });

    // --- Read Receipts: messageSeen ---
    // Fired by the receiver when they open a conversation with senderId
    socket.on("messageSeen", async ({ senderId }) => {
      console.log(`👁️  [Socket] messageSeen — "${userId}" read messages from "${senderId}"`);

      try {
        // Mark all messages from senderId → userId as SEEN in DB
        const seenIds = await markConversationAsSeen(senderId, userId);

        if (seenIds.length === 0) return;

        // Notify the original sender that their messages were seen
        const senderSocketId = userSocketMap[senderId];
        if (senderSocketId) {
          io.to(senderSocketId).emit("messagesSeenByReceiver", { messageIds: seenIds, seenBy: userId });
          console.log(`✅ [Socket] Notified "${senderId}" that ${seenIds.length} message(s) were seen`);
        }
      } catch (err) {
        console.error(`[Socket] messageSeen handler error:`, err.message);
      }
    });

    // --- Typing Indicators ---
    socket.on("typing", ({ receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        console.log(`⌨️  [Socket] "${userId}" typing → "${receiverId}"`);
        io.to(receiverSocketId).emit("userTyping", { senderId: userId });
      }
    });

    socket.on("stopTyping", ({ receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStopTyping", { senderId: userId });
      }
    });

    // --- Disconnect ---
    socket.on("disconnect", async (reason) => {
      console.log(`❌ [Socket] Disconnected — userId: "${userId}", reason: "${reason}"`);
      delete userSocketMap[userId];

      const lastSeen = new Date();
      const lastSeenISO = lastSeen.toISOString();

      // 1. Write lastSeenAt to DB (persistent across Redis/server restarts)
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { lastSeenAt: lastSeen },
        });
        console.log(`🕒 [Socket] lastSeenAt saved to DB for "${userId}"`);
      } catch (err) {
        console.error(`[Socket] DB lastSeenAt update error for "${userId}":`, err.message);
      }

      // 2. Also cache in Redis for fast reads
      try {
        if (redis && redis.status === "ready") {
          await redis.srem("online_users", userId);
          await redis.set(`lastSeen:${userId}`, lastSeenISO);
          console.log(`⚡ [Socket] Removed "${userId}" from online set, lastSeen cached in Redis`);
        }
      } catch (err) {
        console.error(`[Socket] Redis disconnect update error for "${userId}":`, err.message);
      }

      // Broadcast updated online users + last seen timestamp
      const remaining = Object.keys(userSocketMap);
      console.log(`[Socket] ${remaining.length} user(s) still online`);
      io.emit("getOnlineUsers", remaining);
      io.emit("userLastSeen", { userId, lastSeen: lastSeenISO });
    });
  });
};

export default registerSocketHandlers;
