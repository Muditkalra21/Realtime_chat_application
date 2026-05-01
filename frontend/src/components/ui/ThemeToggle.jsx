import { Sun, Moon } from "lucide-react";
import useThemeStore from "../../store/useThemeStore.js";

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className={`p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-400 transition-all duration-200 ${className}`}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;
