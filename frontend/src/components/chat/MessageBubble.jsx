
import { format, isToday, isYesterday } from "date-fns";
import useAuthStore from "../../store/useAuthStore.js";

/**
 * Format a message timestamp
 */
const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return `Yesterday ${format(date, "HH:mm")}`;
  return format(date, "MMM d, HH:mm");
};

/**
 * Read receipt checkmark component.
 * Only shown on messages sent by the current user.
 *
 * SENT      → single grey check  (✓)
 * DELIVERED → double grey checks (✓✓)
 * SEEN      → double blue checks (✓✓)
 */
const ReadReceipt = ({ status }) => {
  if (status === "SEEN") {
    return (
      <span title="Seen" className="inline-flex items-center ml-1 flex-shrink-0">
        {/* Double blue checks */}
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 5.5L5 9.5L11 1.5" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 5.5L9 9.5L15 1.5" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    );
  }

  if (status === "DELIVERED") {
    return (
      <span title="Delivered" className="inline-flex items-center ml-1 flex-shrink-0">
        {/* Double grey checks */}
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 5.5L5 9.5L11 1.5" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 5.5L9 9.5L15 1.5" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    );
  }

  // SENT (default)
  return (
    <span title="Sent" className="inline-flex items-center ml-1 flex-shrink-0">
      {/* Single grey check */}
      <svg width="10" height="9" viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 4.5L4 7.5L9 1.5" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
};

const MessageBubble = ({ message }) => {
  const { user } = useAuthStore();
  const isSent = message.senderId === user.id;

  return (
    <div
      className={`flex items-end gap-2 mb-2 animate-slide-up ${
        isSent ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div className={`flex flex-col gap-1 ${isSent ? "items-end" : "items-start"}`}>
        {/* Image message */}
        {message.type === "IMAGE" && message.imageUrl && (
          <div className={`${isSent ? "msg-bubble-sent" : "msg-bubble-received"} p-1 overflow-hidden`}>
            <img
              src={message.imageUrl}
              alt="Shared image"
              className="rounded-xl max-h-64 w-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.imageUrl, "_blank")}
            />
          </div>
        )}

        {/* Text message */}
        {message.content && (
          <div className={isSent ? "msg-bubble-sent" : "msg-bubble-received"}>
            <p className="text-sm leading-relaxed break-words">{message.content}</p>
          </div>
        )}

        {/* Timestamp + read receipt */}
        <div className={`flex items-center gap-0.5 px-1 ${isSent ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatTime(message.createdAt)}
          </span>
          {/* Only show receipt on messages WE sent */}
          {isSent && <ReadReceipt status={message.status || "SENT"} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
