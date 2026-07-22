import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    logger.warn({
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      stack: err.stack,
    });

    const body: Record<string, unknown> = {
      error: {
        message: err.message,
        code: err.code,
      },
    };

    if (err instanceof ValidationError && err.details) {
      (body.error as Record<string, unknown>).details = err.details;
    }

    res.status(err.statusCode).json(body);
    return;
  }

  logger.error({
    message: err.message,
    stack: err.stack,
    error: err,
  });

  res.status(500).json({
    error: {
      message: config.isProduction ? 'Internal server error' : err.message,
      code: 'INTERNAL_ERROR',
    },
  });
};
