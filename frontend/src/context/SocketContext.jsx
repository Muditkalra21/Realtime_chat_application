import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/useAuthStore.js";
import useChatStore from "../store/useChatStore.js";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuthStore();
  const { addMessage, setOnlineUsers, setTyping, updateMessageStatus, markMessagesAsSeen, setUserLastSeen } = useChatStore();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      // Disconnect if logged out
      if (socket) {
        console.log("[Socket] User logged out — disconnecting socket");
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    console.log(`[Socket] Connecting to ${socketUrl} as userId: "${user.id}"`);

    // Connect socket with userId as query param
    const newSocket = io(socketUrl, {
      query: { userId: user.id },
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log(`🔌 [Socket] Connected — socketId: "${newSocket.id}"`);
    });

    newSocket.on("connect_error", (err) => {
      console.error(`❌ [Socket] Connection error: ${err.message}`);
      console.error("[Socket] Make sure the backend is running on", socketUrl);
    });

    // Receive real-time messages
    newSocket.on("receiveMessage", (message) => {
      const currentSelectedUser = useChatStore.getState().selectedUser;
      console.log(
        `📩 [Socket] receiveMessage — from: "${message.senderId}", activeChat: "${currentSelectedUser?.id}"`
      );
      // Only add to state if we are currently chatting with that person
      if (currentSelectedUser && message.senderId === currentSelectedUser.id) {
        addMessage(message);
        console.log("[Socket] Message added to chat window");
      } else {
        console.log("[Socket] Message received but user is not in that chat — skipping UI update");
      }
    });

    // Online users list
    newSocket.on("getOnlineUsers", (userIds) => {
      console.log(`👥 [Socket] Online users updated: [${userIds.join(", ")}]`);
      setOnlineUsers(userIds);
    });

    // Typing indicators
    newSocket.on("userTyping", ({ senderId }) => {
      console.log(`⌨️  [Socket] "${senderId}" is typing`);
      setTyping(senderId, true);
    });

    newSocket.on("userStopTyping", ({ senderId }) => {
      console.log(`⌨️  [Socket] "${senderId}" stopped typing`);
      setTyping(senderId, false);
    });

    // Read receipts — single message delivered
    newSocket.on("messageStatusUpdated", ({ messageId, status }) => {
      console.log(`✅ [Socket] messageStatusUpdated — id: "${messageId}", status: "${status}"`);
      updateMessageStatus(messageId, status);
    });

    // Read receipts — receiver saw multiple messages at once
    newSocket.on("messagesSeenByReceiver", ({ messageIds }) => {
      console.log(`👁️  [Socket] messagesSeenByReceiver — ${messageIds.length} message(s) marked SEEN`);
      markMessagesAsSeen(messageIds);
    });

    // Last seen — update when any user goes offline
    newSocket.on("userLastSeen", ({ userId, lastSeen }) => {
      console.log(`🕒 [Socket] userLastSeen — userId: "${userId}", lastSeen: "${lastSeen}"`);
      setUserLastSeen(userId, lastSeen);
    });

    newSocket.on("disconnect", (reason) => {
      console.warn(`🔌 [Socket] Disconnected — reason: "${reason}"`);
      if (reason === "io server disconnect") {
        // Server forcibly disconnected — try reconnecting
        console.log("[Socket] Server disconnected client — attempting reconnect...");
        newSocket.connect();
      }
    });

    return () => {
      console.log("[Socket] Cleaning up socket connection");
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
