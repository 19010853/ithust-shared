import { Client } from '@elastic/elasticsearch';
import { Logger } from 'winston';

export function createElasticSearchClient(url: string): Client {
  return new Client({ node: url });
}

interface ElasticConnectionOptions {
  client: Client;
  logger: Logger;
  serviceName: string;
  connectingMessage?: string;
  errorMessage: string;
}

export async function checkElasticSearchConnection({ client, logger, serviceName, connectingMessage, errorMessage }: ElasticConnectionOptions): Promise<void> {
  let isConnected = false;
  while (!isConnected) {
    try {
      if (connectingMessage) logger.info(connectingMessage);
      const health = await client.cluster.health({});
      logger.info(`${serviceName} Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      logger.log('error', errorMessage, error);
      logger.error(`${serviceName} Connection to Elasticsearch failed. Retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

interface ElasticOperationOptions {
  logger: Logger;
  serviceName: string;
  errorMessage: string;
}

export async function createIndexIfMissing(client: Client, indexName: string, options: ElasticOperationOptions): Promise<void> {
  const { logger, errorMessage } = options;
  try {
    const exists = await client.indices.exists({ index: indexName });
    if (!exists) {
      await client.indices.create({ index: indexName });
      await client.indices.refresh({ index: indexName });
    }
  } catch (error) {
    logger.log('error', errorMessage, error);
  }
}

export async function getDocumentCount(client: Client, index: string, options: ElasticOperationOptions): Promise<number> {
  const { logger, errorMessage } = options;
  try {
    const result = await client.count({ index });
    return result.count;
  } catch (error) {
    logger.log('error', errorMessage, error);
    return 0;
  }
}

export async function getIndexedDocument<T>(
  client: Client,
  index: string,
  id: string,
  options: ElasticOperationOptions,
  defaultValue: T
): Promise<T> {
  const { logger, errorMessage } = options;
  try {
    const result = await client.get({ index, id });
    return result._source as T;
  } catch (error) {
    logger.log('error', errorMessage, error);
    return defaultValue;
  }
}

export async function addIndexedDocument(
  client: Client,
  index: string,
  id: string,
  document: unknown,
  options: ElasticOperationOptions
): Promise<void> {
  const { logger, errorMessage } = options;
  try {
    await client.index({ index, id, document });
  } catch (error) {
    logger.log('error', errorMessage, error);
  }
}

export async function updateIndexedDocument(
  client: Client,
  index: string,
  id: string,
  document: unknown,
  options: ElasticOperationOptions
): Promise<void> {
  const { logger, errorMessage } = options;
  try {
    await client.update({ index, id, doc: document });
  } catch (error) {
    logger.log('error', errorMessage, error);
  }
}

export async function deleteIndexedDocument(
  client: Client,
  index: string,
  id: string,
  options: ElasticOperationOptions
): Promise<void> {
  const { logger, errorMessage } = options;
  try {
    await client.delete({ index, id });
  } catch (error) {
    logger.log('error', errorMessage, error);
  }
}
