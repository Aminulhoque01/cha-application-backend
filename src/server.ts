import app from "./app";
import { connectDB } from "./config/db";

import { env } from "./config/env";
import { connectRedis } from "./config/redis";
 

const startServer = async () => {
  try {
    await connectDB();

    await connectRedis();

    app.listen(env.PORT, () => {
      console.log(
        `Server running on http://localhost:${env.PORT}`,
      );
    });
  } catch (error) {
    console.error(
      "Server failed to start:",
      error,
    );

    process.exit(1);
  }
};

startServer();