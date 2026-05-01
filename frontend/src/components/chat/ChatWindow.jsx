import { useEffect, useRef } from "react";
import useChatStore from "../../store/useChatStore.js";
import useAuthStore from "../../store/useAuthStore.js";
import { useSocket } from "../../context/SocketContext.jsx";
import { formatLastSeen } from "../../utils/formatLastSeen.js";
import MessageBubble from "./MessageBubble.jsx";
import MessageInput from "./MessageInput.jsx";
import TypingIndicator from "../ui/TypingIndicator.jsx";
import Avatar from "../ui/Avatar.jsx";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";

const ChatWindow = () => {
  const {
    selectedUser,
    setSelectedUser,
    messages,
    isLoadingMessages,
    fetchMessages,
    typingUsers,
    isUserOnline,
    lastSeenMap,
  } = useChatStore();
  const { user } = useAuthStore();
  const socket = useSocket();
  const bottomRef = useRef(null);

  // Fetch messages when selected user changes
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser, fetchMessages]);

  // Notify server that we have read all messages from selectedUser
  useEffect(() => {
    if (selectedUser && socket) {
      socket.emit("messageSeen", { senderId: selectedUser.id });
    }
  }, [selectedUser, socket]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-200 text-center p-8">
        <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-600/20 flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Welcome to ChatterBox
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Select a contact from the sidebar to start a conversation
        </p>
      </div>
    );
  }

  const isOnline = isUserOnline(selectedUser.id);
  const isTyping = typingUsers[selectedUser.id];

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-dark-200 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-white dark:bg-dark-100 border-b border-gray-100 dark:border-dark-400 shadow-sm">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Back button — mobile only */}
          <button
            onClick={() => setSelectedUser(null)}
            className="md:hidden p-2 -ml-1 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-400 transition-all"
            title="Back to contacts"
          >
            <ArrowLeft size={20} />
          </button>
          <Avatar
            src={selectedUser.avatar}
            username={selectedUser.username}
            size={42}
            isOnline={isOnline}
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {selectedUser.username}
            </h3>
            <p className={`text-xs font-medium ${isOnline ? "text-emerald-500" : "text-gray-400"}`}>
              {isTyping
                ? "typing..."
                : isOnline
                ? "Online"
                : formatLastSeen(lastSeenMap[selectedUser.id])}
            </p>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1">
          <button className="btn-ghost hidden sm:flex" title="Voice call (coming soon)" disabled>
            <Phone size={18} />
          </button>
          <button className="btn-ghost hidden sm:flex" title="Video call (coming soon)" disabled>
            <Video size={18} />
          </button>
          <button className="btn-ghost" title="More options" disabled>
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-1">
        {isLoadingMessages ? (
          <div className="flex justify-center pt-10">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-400 flex items-center justify-center mb-4">
              <Avatar src={selectedUser.avatar} username={selectedUser.username} size={48} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No messages yet. Say hi to{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {selectedUser.username}
              </span>
              ! 👋
            </p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2 mt-2">
            <TypingIndicator />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Message Input */}
      <MessageInput />
    </div>
  );
};

export default ChatWindow;
