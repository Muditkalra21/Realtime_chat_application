import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

/**
 * Generate a signed JWT token for the given user ID.
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Hash a plaintext password using bcrypt.
 * @param {string} password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = (password) => bcrypt.hash(password, 12);

/**
 * Compare a plaintext password against a bcrypt hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

/**
 * Find a user by email, or return null.
 * @param {string} email
 */
export const findUserByEmail = (email) =>
  prisma.user.findUnique({ where: { email } });

/**
 * Find a user that matches email OR username (for duplicate checks).
 * @param {string} email
 * @param {string} username
 */
export const findUserByEmailOrUsername = (email, username) =>
  prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });

/**
 * Create a new user record.
 * @param {{ username: string, email: string, hashedPassword: string }}
 */
export const createUser = ({ username, email, hashedPassword }) =>
  prisma.user.create({
    data: { username, email, password: hashedPassword },
    select: { id: true, username: true, email: true, avatar: true, createdAt: true },
  });

/**
 * Get a user's profile by ID (no password returned).
 * @param {string} id
 */
export const getUserById = (id) =>
  prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, email: true, avatar: true, createdAt: true },
  });

/**
 * Update a user's avatar URL.
 * @param {string} id
 * @param {string} avatar
 */
export const updateUserAvatar = (id, avatar) =>
  prisma.user.update({
    where: { id },
    data: { avatar },
    select: { id: true, username: true, email: true, avatar: true },
  });
