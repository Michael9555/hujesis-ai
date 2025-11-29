import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { sendError } from '../utils/response';
import logger from '../utils/logger';
import { config } from '../config';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  // Log the error
  logger.error(err.message, { stack: err.stack });

  // Handle Yup validation errors
  if (err.name === 'ValidationError' && 'inner' in err) {
    const yupError = err as unknown as { inner: Array<{ path: string; message: string }> };
    const errors: Record<string, string[]> = {};
    
    yupError.inner.forEach((e) => {
      if (e.path) {
        if (!errors[e.path]) {
          errors[e.path] = [];
        }
        errors[e.path].push(e.message);
      }
    });

    return sendError(res, 422, 'VALIDATION_ERROR', 'Validation failed', errors);
  }

  // Handle our custom AppError
  if (err instanceof AppError) {
    if (err instanceof ValidationError) {
      return sendError(res, err.statusCode, err.code, err.message, err.errors);
    }
    return sendError(res, err.statusCode, err.code, err.message);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'INVALID_TOKEN', 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'TOKEN_EXPIRED', 'Authentication token has expired');
  }

  // Handle TypeORM errors
  if (err.name === 'QueryFailedError') {
    const pgError = err as unknown as { code: string; detail?: string };
    
    if (pgError.code === '23505') {
      return sendError(res, 409, 'DUPLICATE_ENTRY', 'A record with this value already exists');
    }
    
    if (pgError.code === '23503') {
      return sendError(res, 400, 'FOREIGN_KEY_VIOLATION', 'Referenced record does not exist');
    }
  }

  // Default error
  const statusCode = 500;
  const message = config.server.isProduction
    ? 'Internal server error'
    : err.message || 'Internal server error';

  return sendError(res, statusCode, 'INTERNAL_ERROR', message);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  return sendError(
    res,
    404,
    'NOT_FOUND',
    `Route ${req.method} ${req.path} not found`
  );
};


