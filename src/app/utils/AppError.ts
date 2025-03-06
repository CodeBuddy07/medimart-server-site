/* eslint-disable @typescript-eslint/no-explicit-any */

export class AppError extends Error {

    statusCode: number;
    status: string;
    isOperational: boolean;
    errors: any; 
  
  
  
    constructor(message: string, statusCode: number, errors: any = null) { 
  
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
      this.errors = errors; 
  
      Error.captureStackTrace(this, this.constructor);
  
    }
  
  }
  


  