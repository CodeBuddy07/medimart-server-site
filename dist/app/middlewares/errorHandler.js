"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong';
    let errors = err.errors || null;
    if ((err === null || err === void 0 ? void 0 : err.message) === 'No product found!') {
        statusCode = 404;
        message = err.message;
    }
    else if ((err === null || err === void 0 ? void 0 : err.name) === 'ValidationError') {
        statusCode = 400;
        errors = err.errors || null;
        message = 'Validation error occurred';
    }
    else if (!err.statusCode && res.statusCode === 200) {
        statusCode = 400;
    }
    const errorResponse = {
        success: false,
        message: message || 'An unexpected error occurred.',
        error: errors ? {
            name: err.name || 'UnknownError',
            errors: errors,
        } : undefined,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    };
    console.error(errorResponse);
    res.status(statusCode).json(errorResponse);
    next();
};
exports.default = errorHandler;
