import { NextFunction, Request, Response } from 'express';
import config from '../config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;  
  let message = err.message || 'Something went wrong';
  let errors = err.errors || null;

  if (err?.message === 'No product found!') {
    statusCode = 404;
    message = err.message;
  } else if (err?.name === 'ValidationError') {
    statusCode = 400;
    errors = err.errors || null;
    message = 'Validation error occurred';
  } else if (!err.statusCode && res.statusCode === 200) {
    statusCode = 400;
  }


  const errorResponse = {
    success: false,
    message: message || 'An unexpected error occurred.',
    error: errors? {
      name: err.name || 'UnknownError',
      errors: errors,
    } : undefined,
    stack: config.environment === 'development' ? err.stack : undefined,
  };

  console.error(errorResponse);


  res.status(statusCode).json(errorResponse);

  next();
};

export default errorHandler;
