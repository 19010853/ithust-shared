import amqp, { Channel } from 'amqplib';
import { Logger } from 'winston';

interface RabbitMQConnectionOptions {
  rabbitMQEndpoint: string;
  logger: Logger;
  successMessage: string;
  errorMessage: string;
}

export async function createRabbitMQConnection({ rabbitMQEndpoint, logger, successMessage, errorMessage }: RabbitMQConnectionOptions): Promise<Channel | undefined> {
  try {
    const connection = await amqp.connect(rabbitMQEndpoint);
    const channel = await connection.createChannel();
    logger.info(successMessage);
    process.once('SIGINT', async () => {
      await channel.close();
      await connection.close();
    });
    return channel;
  } catch (error) {
    logger.log('error', errorMessage, error);
    return undefined;
  }
}

interface PublishDirectOptions {
  channel: Channel;
  createConnection: () => Promise<Channel | undefined>;
  exchangeName: string;
  routingKey: string;
  message: string;
  logMessage: string;
  logger: Logger;
  errorMessage: string;
}

export async function publishDirectMessage({ channel, createConnection, exchangeName, routingKey, message, logMessage, logger, errorMessage }: PublishDirectOptions): Promise<void> {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    await channel.assertExchange(exchangeName, 'direct');
    channel.publish(exchangeName, routingKey, Buffer.from(message));
    logger.info(logMessage);
  } catch (error) {
    logger.log('error', errorMessage, error);
    throw error;
  }
}

interface PublishFanoutOptions {
  channel: Channel;
  createConnection: () => Promise<Channel | undefined>;
  exchangeName: string;
  message: string;
  logMessage: string;
  logger: Logger;
  errorMessage: string;
}

export async function publishFanoutMessage({ channel, createConnection, exchangeName, message, logMessage, logger, errorMessage }: PublishFanoutOptions): Promise<void> {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    await channel.assertExchange(exchangeName, 'fanout');
    channel.publish(exchangeName, '', Buffer.from(message));
    logger.info(logMessage);
  } catch (error) {
    logger.log('error', errorMessage, error);
    throw error;
  }
}
