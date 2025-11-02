import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || "6379"}`,
});

redisClient.connect().catch(console.error);

const resumeAccessLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: "rl:resume_access:",
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: "Too many resume accesses, chill bruh 😭",
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: "rl:upload:",
  }),
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 200,
  message: "Too many uploads bro, try tomorrow 😭",
  standardHeaders: true,
  legacyHeaders: false,
});

export { resumeAccessLimiter, uploadLimiter };
