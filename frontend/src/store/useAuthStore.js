import { create } from "zustand";
import api from "../services/api.js";
import toast from "react-hot-toast";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isLoading: false,

  /**
   * Register a new user
   */
  register: async (data) => {
    console.log(`[AuthStore] register() — email: "${data.email}", username: "${data.username}"`);
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/register", data);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, token });
      console.log(`✅ [AuthStore] register() success — userId: "${user.id}"`);
      toast.success("Account created! Welcome 🎉");
      return true;
    } catch (err) {
      console.error("❌ [AuthStore] register() failed:", err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || "Registration failed");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Login an existing user
   */
  login: async (data) => {
    console.log(`[AuthStore] login() — email: "${data.email}"`);
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/login", data);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, token });
      console.log(`✅ [AuthStore] login() success — userId: "${user.id}", username: "${user.username}"`);
      toast.success(`Welcome back, ${user.username}! 👋`);
      return true;
    } catch (err) {
      console.error("❌ [AuthStore] login() failed:", err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || "Login failed");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Logout current user
   */
  logout: () => {
    console.log("[AuthStore] logout() — clearing session");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
    toast.success("Logged out successfully");
  },

  /**
   * Update user data in store (e.g. after avatar change)
   */
  updateUser: (updated) => {
    console.log("[AuthStore] updateUser() — fields:", Object.keys(updated).join(", "));
    const merged = { ...JSON.parse(localStorage.getItem("user")), ...updated };
    localStorage.setItem("user", JSON.stringify(merged));
    set({ user: merged });
  },
}));

export default useAuthStore;
