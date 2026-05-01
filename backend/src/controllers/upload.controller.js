import { uploadToCloudinary } from "../services/cloudinary.service.js";

/**
 * POST /api/upload
 * Upload a file (avatar or image) to Cloudinary
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const result = await uploadToCloudinary(req.file.buffer, "chatterbox/avatars");
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("❌ [Upload] Error:", err.message);
    res.status(500).json({ message: "Upload failed" });
  }
};
