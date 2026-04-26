import jwt from "jsonwebtoken";

/**
 * Middleware to protect routes — validates JWT from Authorization header.
 */
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn(`🔒 [Auth] Missing or malformed token on ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ message: "Unauthorized — no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user id to request
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.warn(`🔒 [Auth] Invalid token on ${req.method} ${req.originalUrl} — ${err.message}`);
    return res.status(401).json({ message: "Unauthorized — invalid token" });
  }
};

export default protect;

