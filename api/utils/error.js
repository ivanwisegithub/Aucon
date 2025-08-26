// Original error handler function (preserved)
export const errorHandler = (statusCode, message) => {
  const error = new Error();
  error.statusCode = statusCode;
  error.message = message;
  return error;
};

// Enhanced global error handling middleware (new addition)
export const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Enhanced error logging with more context
  console.error('Global Error Handler:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    code: err.code,
    statusCode: err.statusCode,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    user: req.user?.id || 'guest'
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid ${err.path}: ${err.value}`;
    error = errorHandler(404, message);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    let message = 'Duplicate field value entered';
    
    // Enhanced duplicate key error messages
    if (err.keyPattern) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue ? err.keyValue[field] : 'unknown';
      
      // Specific messages for common duplicate scenarios
      if (field === 'email') {
        message = 'An account with this email already exists';
      } else if (field === 'username') {
        message = 'This username is already taken';
      } else if (field === 'preferredDate' || field === 'date') {
        message = 'This time slot is already booked. Please select a different time.';
      } else {
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists: ${value}`;
      }
    }
    
    error = errorHandler(400, message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = errorHandler(400, messages);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Authentication token not found. Please login again.';
    error = errorHandler(401, message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Authentication token expired. Please login again.';
    error = errorHandler(401, message);
  }

  // MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    const message = 'Database connection error. Please try again later.';
    error = errorHandler(503, message);
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large. Please upload a smaller file.';
    error = errorHandler(400, message);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Too many files uploaded or unexpected file field.';
    error = errorHandler(400, message);
  }

  // Rate limiting errors
  if (err.name === 'RateLimitError' || err.code === 'RATE_LIMIT_EXCEEDED') {
    const message = 'Too many requests. Please try again later.';
    error = errorHandler(429, message);
  }

  // Permission errors
  if (err.code === 'EACCES' || err.code === 'EPERM') {
    const message = 'Permission denied. Please contact administrator.';
    error = errorHandler(403, message);
  }

  // Network and timeout errors
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    const message = 'Service temporarily unavailable. Please try again later.';
    error = errorHandler(503, message);
  }

  if (err.code === 'ETIMEDOUT' || err.name === 'TimeoutError') {
    const message = 'Request timeout. Please try again.';
    error = errorHandler(408, message);
  }

  // Handle specific HTTP status codes
  if (err.statusCode === 404 && !err.message.includes('not found')) {
    error.message = 'Resource not found';
  }

  if (err.statusCode === 403 && !err.message.includes('forbidden')) {
    error.message = 'Access forbidden. Insufficient permissions.';
  }

  // Default error response with enhanced structure
  const response = {
    success: false,
    message: error.message || 'Server Error',
    ...(error.statusCode && { statusCode: error.statusCode }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: {
        name: err.name,
        code: err.code,
        path: err.path,
        value: err.value
      }
    })
  };

  // Handle array of messages (for validation errors)
  if (Array.isArray(error.message)) {
    response.message = 'Validation failed';
    response.errors = error.message;
  }

  res.status(error.statusCode || 500).json(response);
};

// Additional utility function for async error handling
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error classes for specific scenarios
export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Access forbidden') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

export class ValidationError extends Error {
  constructor(message = 'Validation failed', errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.errors = errors;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class ConflictError extends Error {
  constructor(message = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

// Helper function to create standardized API responses
export const createResponse = (success = true, message = '', data = null, statusCode = 200) => {
  const response = {
    success,
    message,
    ...(data && { data }),
    timestamp: new Date().toISOString()
  };
  
  return { response, statusCode };
};

// Helper function for success responses
export const successResponse = (res, message = 'Success', data = null, statusCode = 200) => {
  const { response } = createResponse(true, message, data, statusCode);
  return res.status(statusCode).json(response);
};

// Helper function for error responses
export const errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    timestamp: new Date().toISOString()
  };
  
  return res.status(statusCode).json(response);
};