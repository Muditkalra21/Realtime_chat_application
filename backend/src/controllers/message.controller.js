import {
  getConversation,
  createTextMessage,
  createImageMessage,
} from "../services/message.service.js";
import { uploadToCloudinary } from "../services/cloudinary.service.js";

/**
 * GET /api/messages/:userId
 * Fetch conversation between current user and :userId
 */
export const getMessages = async (req, res) => {
  try {
    const { userId: otherId } = req.params;
    const myId = req.userId;
    console.log(`💬 [GetMessages] Fetching conversation: "${myId}" ↔ "${otherId}"`);

    const messages = await getConversation(myId, otherId);

    console.log(`✅ [GetMessages] Found ${messages.length} messages`);
    res.json(messages);
  } catch (err) {
    console.error("❌ [GetMessages] Error:", err.message, err.stack);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/messages/send/:userId
 * Send a text message to :userId
 */
export const sendMessage = async (req, res) => {
  try {
    const { userId: receiverId } = req.params;
    const senderId = req.userId;
    const { content } = req.body;
    console.log(`📨 [SendMessage] "${senderId}" → "${receiverId}" | content: "${content?.slice(0, 50)}"`);

    if (!content || !content.trim()) {
      console.warn("[SendMessage] Empty content rejected");
      return res.status(400).json({ message: "Message content is required" });
    }

    const message = await createTextMessage({ content: content.trim(), senderId, receiverId });

    console.log(`✅ [SendMessage] Saved — messageId: "${message.id}"`);
    res.status(201).json(message);
  } catch (err) {
    console.error("❌ [SendMessage] Error:", err.message, err.stack);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/messages/send-image/:userId
 * Upload an image to Cloudinary and send it as a message
 */
export const sendImageMessage = async (req, res) => {
  try {
    const { userId: receiverId } = req.params;
    const senderId = req.userId;
    console.log(`🖼️  [SendImage] "${senderId}" → "${receiverId}" | file: "${req.file?.originalname}", size: ${req.file?.size} bytes`);

    if (!req.file) {
      console.warn("[SendImage] No file attached to request");
      return res.status(400).json({ message: "No image provided" });
    }

    console.log("[SendImage] Uploading to Cloudinary...");
    const uploadResult = await uploadToCloudinary(req.file.buffer, "chatterbox/messages");
    console.log(`[SendImage] Cloudinary upload OK — publicId: "${uploadResult.public_id}"`);

    const message = await createImageMessage({
      imageUrl: uploadResult.secure_url,
      senderId,
      receiverId,
    });

    console.log(`✅ [SendImage] Saved — messageId: "${message.id}", url: "${message.imageUrl}"`);
    res.status(201).json(message);
  } catch (err) {
    console.error("❌ [SendImageMessage] Error:", err.message, err.stack);
    res.status(500).json({ message: "Server error" });
  }
};
