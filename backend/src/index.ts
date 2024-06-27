import { app, logger } from './app';
import config from './utils/config';

const server = app.listen(config.PORT, () => {
  const { NODE_ENV, SERVER_NAME, HOST, PORT } = config;
  logger.info(`Server ${SERVER_NAME} is listening on ${HOST}:${PORT} (mode: [${NODE_ENV}]).`);
});

const shutdownHandler = () => {
  logger.info('Received signal to shutdown server.');
  server.close(() => {
    logger.info('Server shut down successfully.');
    process.exit();
  });
  // if clean shutdown takes more than 20s, kill the process
  setTimeout(() => process.exit(1), 20000).unref();
};

const errorHandler = (error: Error) => {
  logger.fatal(error, 'An unhandled error occurred.');
  server.close(() => {
    logger.info('Server shut down due to an unhandled exception.');
    process.exit(1);
  });
};

process.on('uncaughtException', errorHandler);
process.on('unhandledRejection', errorHandler);
process.on('SIGINT', shutdownHandler);
process.on('SIGTERM', shutdownHandler);
