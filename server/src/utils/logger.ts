import winston from 'winston';
import { config } from '../config';

const formats = [
  config.isProduction ? winston.format.json() : winston.format.prettyPrint(),
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
];

export const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(...formats),
  defaultMeta: { service: 'nexus-os' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});
