import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Handle invalid JSON syntax in request body
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON payload in request body.',
      },
    });
  }

  if (err instanceof AppError) {
    const errorPayload: Record<string, any> = {
      code: err.code,
      message: err.message,
    };

    if (err.details !== undefined) {
      errorPayload.details = err.details;
    }

    return res.status(err.statusCode).json({
      success: false,
      error: errorPayload,
    });
  }

  console.error('Unhandled Error:', err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred.',
    },
  });
};
