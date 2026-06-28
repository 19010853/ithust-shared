import { Client } from '@elastic/elasticsearch';
import { Logger } from 'winston';

export function createElasticSearchClient(url: string): Client {
  return new Client({ node: url });
}

interface ElasticConnectionOptions {
  client: Client;
  logger: Logger;
  serviceName: string;
  errorMessage: string;
}

export async function checkElasticSearchConnection({ client, logger, serviceName, errorMessage }: ElasticConnectionOptions): Promise<void> {
  let isConnected = false;
  while (!isConnected) {
    try {
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
