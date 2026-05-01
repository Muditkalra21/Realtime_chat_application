/**
 * Avatar component with online indicator
 */
const Avatar = ({ src, username, size = 40, isOnline = false, className = "" }) => {
  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : "??";

  // Generate a consistent color based on username
  const colors = [
    "bg-violet-500", "bg-indigo-500", "bg-blue-500", "bg-cyan-500",
    "bg-teal-500", "bg-emerald-500", "bg-pink-500", "bg-rose-500",
  ];
  const colorIndex = username
    ? username.charCodeAt(0) % colors.length
    : 0;
  const bgColor = colors[colorIndex];

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      {src ? (
        <img
          src={src}
          alt={username}
          className="avatar w-full h-full"
          style={{ borderRadius: "50%" }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      ) : (
        <div
          className={`${bgColor} w-full h-full rounded-full flex items-center justify-center text-white font-semibold select-none`}
          style={{ fontSize: size * 0.35 }}
        >
          {initials}
        </div>
      )}

      {isOnline && (
        <span className="online-dot" style={{ width: size * 0.3, height: size * 0.3, borderWidth: 2 }} />
      )}
    </div>
  );
};

export default Avatar;
