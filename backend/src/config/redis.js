import Redis from "ioredis";

let redis = null;

/**
 * Connect to Redis. Gracefully falls back if Redis is unavailable.
 */
const connectRedis = () => {
  try {
    redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      lazyConnect: true,
      retryStrategy: (times) => {
        // Stop retrying after 3 attempts
        if (times > 3) { 
          console.warn("⚠️  Redis unavailable — running without cache");
          return null;
        }
        return Math.min(times * 200, 1000);
      },
    });

    redis.on("connect", () => console.log("✅ Redis connected"));
    redis.on("error", (err) => {
      if (err.code !== "ECONNREFUSED") {
        console.error("Redis error:", err.message);
      }
    });
  } catch (err) {
    console.warn("⚠️  Could not initialize Redis:", err.message);
  }
};

connectRedis();

export default redis;
