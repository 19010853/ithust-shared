import { createClient } from 'redis';
import { Logger } from 'winston';

// Use 'any' to avoid consumers needing 'redis' as a transitive type dependency.
// Only gateway-service and gig-service actually use Redis.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RedisClient = any;

export function createRedisConnection(host: string, logger: Logger): RedisClient {
  const client = createClient({ url: host });
  client.on('error', (error: Error) => {
    logger.log('error', `RedisClient on error event: ${error.message}`);
  });
  return client;
}

export async function connectRedisClient(client: RedisClient, logger: Logger, successMessage: string, errorMessage: string): Promise<void> {
  try {
    await client.connect();
    logger.info(successMessage);
  } catch (error) {
    logger.log('error', errorMessage, error);
  }
}

export async function ensureRedisClientOpen(client: RedisClient): Promise<void> {
  if (!client.isOpen) {
    await client.connect();
  }
}
