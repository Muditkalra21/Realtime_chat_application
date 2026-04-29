import prisma from "../config/prisma.js";

/**
 * Fetch all messages between two users, ordered oldest → newest.
 * @param {string} myId
 * @param {string} otherId
 */
export const getConversation = (myId, otherId) =>
  prisma.message.findMany({
    where: {
      OR: [
        { senderId: myId, receiverId: otherId },
        { senderId: otherId, receiverId: myId },
      ],
    },
    include: {
      sender: { select: { id: true, username: true, avatar: true } },
    },
    orderBy: { createdAt: "asc" },
  });

/**
 * Save a text message to the database.
 * @param {{ content: string, senderId: string, receiverId: string }}
 */
export const createTextMessage = ({ content, senderId, receiverId }) =>
  prisma.message.create({
    data: { content, senderId, receiverId, type: "TEXT" },
    include: {
      sender: { select: { id: true, username: true, avatar: true } },
    },
  });

/**
 * Save an image message to the database.
 * @param {{ imageUrl: string, senderId: string, receiverId: string }}
 */
export const createImageMessage = ({ imageUrl, senderId, receiverId }) =>
  prisma.message.create({
    data: { imageUrl, type: "IMAGE", senderId, receiverId },
    include: {
      sender: { select: { id: true, username: true, avatar: true } },
    },
  });

/**
 * Update the status of a single message.
 * Only upgrades status — SEEN > DELIVERED > SENT (never downgrades).
 * @param {string} messageId
 * @param {"DELIVERED"|"SEEN"} status
 */
export const updateMessageStatus = (messageId, status) =>
  prisma.message.update({
    where: { id: messageId },
    data: { status },
    select: { id: true, status: true, senderId: true, receiverId: true },
  });

/**
 * Mark all SENT/DELIVERED messages from senderId → receiverId (currentUserId) as SEEN.
 * Returns the updated message IDs so the server can notify the sender.
 * @param {string} senderId    — the person who sent the messages
 * @param {string} receiverId  — the current user who is now reading them
 */
export const markConversationAsSeen = async (senderId, receiverId) => {
  // Find all unseen messages in this direction
  const unseen = await prisma.message.findMany({
    where: {
      senderId,
      receiverId,
      status: { in: ["SENT", "DELIVERED"] },
    },
    select: { id: true },
  });

  if (unseen.length === 0) return [];

  const ids = unseen.map((m) => m.id);

  await prisma.message.updateMany({
    where: { id: { in: ids } },
    data: { status: "SEEN" },
  });

  return ids;
};
