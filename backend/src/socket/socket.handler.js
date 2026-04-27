import redis from "../config/redis.js";

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
    socket.on("sendMessage", ({ receiverId, message }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        console.log(`📨 [Socket] sendMessage from "${userId}" → "${receiverId}" (messageId: "${message?.id}")`);
        io.to(receiverSocketId).emit("receiveMessage", message);
      } else {
        console.warn(`[Socket] sendMessage: receiver "${receiverId}" not online — message not delivered in real-time`);
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

      // Remove from Redis
      try {
        if (redis && redis.status === "ready") {
          await redis.srem("online_users", userId);
          console.log(`⚡ [Socket] Removed "${userId}" from Redis online_users set`);
        }
      } catch (err) {
        console.error(`[Socket] Redis SREM error for "${userId}":`, err.message);
      }

      // Broadcast updated online users
      const remaining = Object.keys(userSocketMap);
      console.log(`[Socket] ${remaining.length} user(s) still online`);
      io.emit("getOnlineUsers", remaining);
    });
  });
};

export default registerSocketHandlers;

