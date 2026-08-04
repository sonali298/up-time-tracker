import IORedis from "ioredis";
import type { RedisOptions } from "ioredis";

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  family: 0,
};

// Agar Upstash/rediss use ho raha hai, toh TLS (security) on karna padega
if (process.env.REDIS_URL?.startsWith('rediss://')) {
  redisOptions.tls = { rejectUnauthorized: false };
}

declare global {
  // eslint-disable-next-line no-var
  var redisClient: IORedis | undefined;
}

function attachErrorHandler(client: IORedis) {
  // AB HUMEIN ASLI ERROR DIKHEGA AGAR KUCH FAIL HUA TOH
  client.on("error", (err) => {
    console.error("🔴 REDIS ASLI ERROR:", err.message);
  });
  return client;
}

export function getRedisClient() {
  if (!global.redisClient) {
    global.redisClient = attachErrorHandler(new IORedis(getRedisUrl(), redisOptions));
  }
  return global.redisClient;
}

export function createRedisConnection() {
  return attachErrorHandler(new IORedis(getRedisUrl(), redisOptions));
}

export async function isRedisReachable(timeoutMs = 1_500) {
  const probe = createRedisConnection();
  try {
    await Promise.race([
      probe.ping(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("redis ping timeout")), timeoutMs),
      ),
    ]);
    await probe.quit();
    return true;
  } catch {
    probe.disconnect();
    return false;
  }
}

function getRedisUrl() {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (redisUrl) {
    return redisUrl;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("REDIS_URL is missing in production.");
  }

  return "redis://127.0.0.1:6379";
}