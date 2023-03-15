import winston from 'winston';
import config from './config';

const errorStackFormat = winston.format((info) => {
  if (info instanceof Error) {
    return { ...info, stack: info.stack, message: info.message };
  }
  return info;
});
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(winston.format.timestamp(), winston.format.simple(), errorStackFormat()),
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true,
    }),
    new winston.transports.Console({ filename: 'error.log', level: 'error' }),
  ],
});
module.exports = logger;
