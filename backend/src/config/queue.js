import Bull from "bull";

const redisUrl = process.env.REDIS_URL;

export const buildQueue = new Bull("build-queue", redisUrl);
