import { create } from "zustand";
import api from "../services/api.js";
import toast from "react-hot-toast";

const useChatStore = create((set, get) => ({
  users: [],
  selectedUser: null,
  messages: [],
  onlineUsers: [],
  isLoadingUsers: false,
  isLoadingMessages: false,
  typingUsers: {}, // { [userId]: boolean }
  lastSeenMap: {}, // { [userId]: ISO string | null }
  unreadCounts: {}, // { [userId]: number } — count of unread messages per sender

  /**
   * Fetch all users to display in sidebar
   */
  fetchUsers: async () => {
    console.log("[ChatStore] fetchUsers() — loading contacts");
    set({ isLoadingUsers: true });
    try {
      const res = await api.get("/users");
      console.log(`✅ [ChatStore] fetchUsers() — loaded ${res.data.length} contacts`);
      // Build lastSeenMap from the initial response
      const lastSeenMap = {};
      const unreadCounts = {};
      res.data.forEach((u) => {
        if (u.lastSeen) lastSeenMap[u.id] = u.lastSeen;
        if (u.unreadCount) unreadCounts[u.id] = u.unreadCount;
      });
      set({ users: res.data, lastSeenMap, unreadCounts });
    } catch (err) {
      console.error("❌ [ChatStore] fetchUsers() failed:", err.response?.data?.message || err.message);
      toast.error("Failed to load contacts");
    } finally {
      set({ isLoadingUsers: false });
    }
  },

  /**
   * Set the currently active chat partner
   */
  setSelectedUser: (user) => {
    if (get().selectedUser?.id === user?.id) return;
    console.log(`[ChatStore] setSelectedUser() — "${user?.username}" (id: "${user?.id}")`);
    // Clear unread count for this user when opening their chat
    set((state) => ({
      selectedUser: user,
      messages: [],
      typingUsers: {},
      unreadCounts: { ...state.unreadCounts, [user?.id]: 0 },
    }));
  },

  /**
   * Fetch messages for current conversation
   */
  fetchMessages: async (userId) => {
    console.log(`[ChatStore] fetchMessages() — userId: "${userId}"`);
    set({ isLoadingMessages: true });
    try {
      const res = await api.get(`/messages/${userId}`);
      console.log(`✅ [ChatStore] fetchMessages() — loaded ${res.data.length} messages`);
      set({ messages: res.data });
    } catch (err) {
      console.error("❌ [ChatStore] fetchMessages() failed:", err.response?.data?.message || err.message);
      toast.error("Failed to load messages");
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  /**
   * Send a text message via REST API
   */
  sendMessage: async (receiverId, content) => {
    console.log(`[ChatStore] sendMessage() — to: "${receiverId}", content: "${content?.slice(0, 50)}"`);
    try {
      const res = await api.post(`/messages/send/${receiverId}`, { content });
      console.log(`✅ [ChatStore] sendMessage() — messageId: "${res.data.id}"`);
      set((state) => ({ messages: [...state.messages, res.data] }));
      return res.data;
    } catch (err) {
      console.error("❌ [ChatStore] sendMessage() failed:", err.response?.data?.message || err.message);
      toast.error("Failed to send message");
      return null;
    }
  },

  /**
   * Send an image message via REST API
   */
  sendImageMessage: async (receiverId, file) => {
    console.log(`[ChatStore] sendImageMessage() — to: "${receiverId}", file: "${file?.name}", size: ${file?.size} bytes`);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post(`/messages/send-image/${receiverId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(`✅ [ChatStore] sendImageMessage() — messageId: "${res.data.id}", url: "${res.data.imageUrl}"`);
      set((state) => ({ messages: [...state.messages, res.data] }));
      return res.data;
    } catch (err) {
      console.error("❌ [ChatStore] sendImageMessage() failed:", err.response?.data?.message || err.message);
      toast.error("Failed to send image");
      return null;
    }
  },

  /**
   * Add a new message received via socket
   */
  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },

  /**
   * Update online users list (from socket)
   */
  setOnlineUsers: (userIds) => {
    set({ onlineUsers: userIds });
  },

  /**
   * Mark a user as typing
   */
  setTyping: (userId, isTyping) => {
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: isTyping },
    }));
  },

  /**
   * Check if a user is online
   */
  isUserOnline: (userId) => {
    return get().onlineUsers.includes(userId);
  },

  /**
   * Update the status of a single message in the local messages array.
   * Called when the socket notifies us of a status change.
   * @param {string} messageId
   * @param {"SENT"|"DELIVERED"|"SEEN"} status
   */
  updateMessageStatus: (messageId, status) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, status } : msg
      ),
    }));
  },

  /**
   * Mark multiple messages as SEEN in one update.
   * @param {string[]} messageIds
   */
  markMessagesAsSeen: (messageIds) => {
    const idSet = new Set(messageIds);
    set((state) => ({
      messages: state.messages.map((msg) =>
        idSet.has(msg.id) ? { ...msg, status: "SEEN" } : msg
      ),
    }));
  },

  /**
   * Increment unread count for a specific sender.
   * Called when a message arrives from a chat that is NOT currently open.
   * @param {string} senderId
   */
  incrementUnread: (senderId) => {
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [senderId]: (state.unreadCounts[senderId] || 0) + 1,
      },
    }));
  },

  /**
   * Update the lastSeen timestamp for a specific user.
   * Called when a socket userLastSeen event arrives.
   * @param {string} userId
   * @param {string} lastSeen - ISO date string
   */
  setUserLastSeen: (userId, lastSeen) => {
    set((state) => ({
      lastSeenMap: { ...state.lastSeenMap, [userId]: lastSeen },
    }));
  },
}));

export default useChatStore;
