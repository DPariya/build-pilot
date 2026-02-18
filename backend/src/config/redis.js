import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://redis:6379";

// Publisher: used by worker to publish log lines
const publisher = new Redis(redisUrl);

// Subscriber: used by WebSocket server
// const subscriber = new Redis(redisUrl);

publisher.on("error", (err) => {
  console.error("Redis Publisher Error:", err);
});

// subscriber.on("error", (err) => {
//   console.error("Redis Subscriber Error:", err);
// });

export { publisher };
