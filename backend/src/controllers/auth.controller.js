import {
  generateToken,
  hashPassword,
  verifyPassword,
  findUserByEmail,
  findUserByEmailOrUsername,
  createUser,
  getUserById,
  updateUserAvatar,
} from "../services/auth.service.js";

/**
 * POST /api/auth/register
 * Register a new user
 */
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(`📝 [Register] Attempt — username: "${username}", email: "${email}"`);

    if (!username || !email || !password) {
      console.warn("[Register] Missing fields:", { username: !!username, email: !!email, password: !!password });
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      console.warn(`[Register] Password too short for "${email}"`);
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await findUserByEmailOrUsername(email, username);
    if (existing) {
      console.warn(`[Register] Conflict — "${existing.email === email ? "email" : "username"}" already taken`);
      return res.status(409).json({ message: "Email or username already taken" });
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser({ username, email, hashedPassword });

    const token = generateToken(user.id);
    console.log(`✅ [Register] Success — userId: "${user.id}", username: "${user.username}"`);

    res.status(201).json({ token, user });
  } catch (err) {
    console.error("❌ [Register] Error:", err.message, err.stack);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/auth/login
 * Login with email + password
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔑 [Login] Attempt — email: "${email}"`);

    if (!email || !password) {
      console.warn("[Login] Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      console.warn(`[Login] No user found for email: "${email}"`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      console.warn(`[Login] Wrong password for email: "${email}"`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user.id);
    console.log(`✅ [Login] Success — userId: "${user.id}", username: "${user.username}"`);

    const { password: _pw, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error("❌ [Login] Error:", err.message, err.stack);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export const getMe = async (req, res) => {
  try {
    console.log(`👤 [GetMe] userId: "${req.userId}"`);

    const user = await getUserById(req.userId);
    if (!user) {
      console.warn(`[GetMe] User not found for id: "${req.userId}"`);
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("❌ [GetMe] Error:", err.message, err.stack);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/auth/update-avatar
 * Update user avatar URL
 */
export const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    console.log(`🖼️  [UpdateAvatar] userId: "${req.userId}", url: "${avatar}"`);

    if (!avatar) {
      console.warn("[UpdateAvatar] No avatar URL provided");
      return res.status(400).json({ message: "Avatar URL is required" });
    }

    const user = await updateUserAvatar(req.userId, avatar);
    console.log(`✅ [UpdateAvatar] Updated for userId: "${req.userId}"`);
    res.json(user);
  } catch (err) {
    console.error("❌ [UpdateAvatar] Error:", err.message, err.stack);
    res.status(500).json({ message: "Server error" });
  }
};
