import { redisClient } from "../config/redis";

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