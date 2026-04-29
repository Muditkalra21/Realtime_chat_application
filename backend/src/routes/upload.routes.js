import { Router } from "express";
import multer from "multer";
import { uploadFile } from "../controllers/upload.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/", protect, upload.single("file"), uploadFile);

export default router;
