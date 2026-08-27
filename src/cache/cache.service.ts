import { redisClient } from "../config/redis";

export const setCache = async <T>(
  key: string,
  value: T,
  ttl = 300,
): Promise<void> => {
  await redisClient.setEx(
    key,
    ttl,
    JSON.stringify(value),
  );
};

export const getCache = async <T>(
  key: string,
): Promise<T | null> => {
  const cachedValue =
    await redisClient.get(key);

  if (!cachedValue) {
    return null;
  }

  return JSON.parse(cachedValue) as T;
};

export const deleteCache = async (
  key: string,
): Promise<void> => {
  await redisClient.del(key);
};

export const deleteManyCache = async (
  keys: string[],
): Promise<void> => {
  if (keys.length === 0) {
    return;
  }

  await redisClient.del(keys);
};

export const clearCacheByPattern = async (
  pattern: string,
): Promise<void> => {
  let cursor = "0";

  const keys: string[] = [];

  do {
    const result = await redisClient.scan(
      cursor,
      {
        MATCH: pattern,
        COUNT: 100,
      },
    );

    cursor = result.cursor;

    keys.push(...result.keys);
  } while (cursor !== "0");

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};