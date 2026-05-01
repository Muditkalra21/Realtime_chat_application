import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import useAuthStore from "./store/useAuthStore.js";
import useThemeStore from "./store/useThemeStore.js";

function App() {
  const { user } = useAuthStore();
  const { initTheme } = useThemeStore();

  // Initialize theme from localStorage on app load
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--toast-bg, #fff)",
            color: "var(--toast-color, #1a1a2e)",
            borderRadius: "12px",
            fontSize: "14px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <RegisterPage />}
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
