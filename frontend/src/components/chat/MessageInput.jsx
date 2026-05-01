import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Image, X } from "lucide-react";
import useChatStore from "../../store/useChatStore.js";
import { useSocket } from "../../context/SocketContext.jsx";

const TYPING_TIMEOUT = 1500; // ms before emitting stopTyping

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const isTypingRef = useRef(false);
  const typingTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  const { selectedUser, sendMessage, sendImageMessage } = useChatStore();
  const socket = useSocket();

  // Emit typing events
  const emitTyping = useCallback(() => {
    if (!socket || !selectedUser) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing", { receiverId: selectedUser.id });
    }

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("stopTyping", { receiverId: selectedUser.id });
    }, TYPING_TIMEOUT);
  }, [selectedUser, socket]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    emitTyping();
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    // Revoke the object URL to free memory
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if (!selectedUser || isSending) return;
    if (!text.trim() && !imageFile) return;

    setIsSending(true);

    // Stop typing indicator
    clearTimeout(typingTimerRef.current);
    isTypingRef.current = false;
    socket?.emit("stopTyping", { receiverId: selectedUser.id });

    let sentMessage = null;

    if (imageFile) {
      sentMessage = await sendImageMessage(selectedUser.id, imageFile);
      clearImage();
    }

    if (text.trim()) {
      sentMessage = await sendMessage(selectedUser.id, text.trim());
      setText("");
    }

    // Emit to socket for real-time delivery
    if (sentMessage && socket) {
      socket.emit("sendMessage", {
        receiverId: selectedUser.id,
        message: sentMessage,
      });
    }

    setIsSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeout(typingTimerRef.current);
  }, []);

  return (
    <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-dark-400">
      {/* Image preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-3 p-2 bg-gray-50 dark:bg-dark-400 rounded-xl">
          <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
          <div className="flex-1 text-sm text-gray-600 dark:text-gray-400">
            {imageFile?.name}
          </div>
          <button
            onClick={clearImage}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-500 text-gray-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Image upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          id="image-upload"
          onChange={handleImageSelect}
        />
        <label
          htmlFor="image-upload"
          className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-400 cursor-pointer transition-all"
          title="Send image"
        >
          <Image size={20} />
        </label>

        {/* Text input */}
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${selectedUser?.username || ""}...`}
          className="input-base flex-1"
          disabled={isSending}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={(!text.trim() && !imageFile) || isSending}
          className="p-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          title="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
