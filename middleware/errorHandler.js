const { StatusCodes } = require('http-status-codes');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      errors
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(StatusCodes.CONFLICT).json({
      success: false,
      message: 'Duplicate field value entered'
    });
  }

  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`
    });
  }

  // Default error response
  res.status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message || 'Server Error'
  });
};

module.exports = errorHandler;
