import { Router } from "express";
import { register, login, getMe, updateAvatar } from "../controllers/auth.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/update-avatar", protect, updateAvatar);

export default router;
