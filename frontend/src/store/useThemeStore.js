import { create } from "zustand";

const useThemeStore = create((set) => ({
  isDark: localStorage.getItem("theme") === "dark",

  toggleTheme: () =>
    set((state) => {
      const newDark = !state.isDark;
      localStorage.setItem("theme", newDark ? "dark" : "light");

      // Toggle the `dark` class on <html> for Tailwind's class-based dark mode
      if (newDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      return { isDark: newDark };
    }),

  initTheme: () => {
    const isDark = localStorage.getItem("theme") === "dark";
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },
}));

export default useThemeStore;
