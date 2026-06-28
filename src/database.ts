import mongoose from 'mongoose';
import { Logger } from 'winston';

interface DatabaseOptions {
  databaseUrl: string;
  logger: Logger;
  successMessage: string;
  errorMessage: string;
}

export async function connectMongooseDatabase({ databaseUrl, logger, successMessage, errorMessage }: DatabaseOptions): Promise<void> {
  try {
    await mongoose.connect(databaseUrl);
    logger.info(successMessage);
  } catch (error) {
    logger.log('error', errorMessage, error);
  }
}
