import { format, isToday, isYesterday, formatDistanceToNowStrict } from "date-fns";

/**
 * Format a lastSeen ISO timestamp into a human-readable string.
 * Examples:
 *   "Today at 4:30 PM"
 *   "Yesterday at 11:02 AM"
 *   "3 days ago"
 *   "Apr 12 at 9:15 AM"
 *
 * @param {string|null} lastSeen - ISO date string or null
 * @returns {string}
 */
export const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return "Last seen a while ago";

  const date = new Date(lastSeen);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  // Within the last 2 minutes — just say "just now"
  if (diffMins < 2) return "Last seen just now";

  if (isToday(date)) return `Last seen today at ${format(date, "h:mm a")}`;
  if (isYesterday(date)) return `Last seen yesterday at ${format(date, "h:mm a")}`;

  // Within the last 7 days — relative
  if (diffMs < 7 * 24 * 60 * 60 * 1000) {
    return `Last seen ${formatDistanceToNowStrict(date, { addSuffix: true })}`;
  }

  // Older — show full date
  return `Last seen ${format(date, "MMM d")} at ${format(date, "h:mm a")}`;
};
