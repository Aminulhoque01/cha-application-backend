import { createClient } from "redis";

import { env } from "./env";

export const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

redisClient.on("connect", () => {
  console.log("Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("Redis ready");
});

redisClient.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

export const connectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    return;
  }

  await redisClient.connect();

  console.log("Redis connected");
};

export const disconnectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    return;
  }

  await redisClient.quit();

  console.log("Redis disconnected");
};