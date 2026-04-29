import { Router } from "express";
import multer from "multer";
import {
  getMessages,
  sendMessage,
  sendImageMessage,
} from "../controllers/message.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = Router();

// Use memory storage so we can stream to Cloudinary
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/:userId", protect, getMessages);
router.post("/send/:userId", protect, sendMessage);
router.post("/send-image/:userId", protect, upload.single("image"), sendImageMessage);

export default router;
