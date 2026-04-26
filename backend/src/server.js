import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

// Route imports
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

// Socket handler
import registerSocketHandlers from "./socket/socket.handler.js";

const app = express();
const httpServer = createServer(app);

// --- Socket.IO Setup ---
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

registerSocketHandlers(io);

// --- Express Middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- HTTP Request Logger ---
// Logs every incoming request: method, URL, status code, and response time
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    const statusIcon = res.statusCode >= 400 ? "❌" : "✅";
    console.log(
      `${statusIcon} [${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`
    );
  });
  next();
});

// --- Health Check ---
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

// --- 404 Handler ---
app.use((req, res) => {
  console.warn(`⚠️  [404] Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: "Route not found" });
});

// --- Global Error Handler ---
// Catches any errors thrown inside route handlers
app.use((err, req, res, next) => {
  console.error(`💥 [Unhandled Error] ${req.method} ${req.originalUrl}`, err);
  res.status(500).json({ message: "Internal server error" });
});

// --- Catch unhandled promise rejections ---
process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 [UnhandledRejection]", reason);
});

// --- Catch uncaught exceptions ---
process.on("uncaughtException", (err) => {
  console.error("💥 [UncaughtException]", err);
  process.exit(1); // Exit so nodemon can restart cleanly
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log("─────────────────────────────────────────");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment  : ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 CORS Origin  : ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  console.log(`🗃️  Database     : ${process.env.DATABASE_URL ? "✅ configured" : "❌ NOT SET"}`);
  console.log(`⚡ Redis        : ${process.env.REDIS_URL ? "✅ configured" : "⚠️  not set (fallback active)"}`);
  console.log(`☁️  Cloudinary   : ${process.env.CLOUDINARY_CLOUD_NAME ? "✅ configured" : "⚠️  not configured"}`);
  console.log("─────────────────────────────────────────");
});
