/**
 * Animated typing indicator (three bouncing dots)
 */
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-dark-400 rounded-2xl rounded-bl-sm w-fit border border-gray-100 dark:border-dark-500 animate-fade-in">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full inline-block"
        style={{
          animation: "pulseDot 1.4s infinite ease-in-out",
          animationDelay: `${i * 0.16}s`,
        }}
      />
    ))}
  </div>
);

export default TypingIndicator;
