import { redisClient } from "../config/redis";

export const setCache = async <T>(
  key: string,
  value: T,
  ttl = 300
): Promise<void> => {
  await redisClient.setEx(
    key,
    ttl,
    JSON.stringify(value)
  );
};

export const getCache =
  async <T>(
    key: string
  ): Promise<T | null> => {
    const value =
      await redisClient.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  };

export const deleteCache =
  async (
    key: string
  ): Promise<void> => {
    await redisClient.del(key);
  };