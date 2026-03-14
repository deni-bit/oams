// ─── 404 Not Found ───────────────────────────────────
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// ─── Global Error Handler ────────────────────────────
const errorHandler = (err, req, res, next) => {
  // If status is still 200 something went wrong — default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Server-side log in development only
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${statusCode}] ${err.message}`);
  }

  // Handle specific Mongoose errors cleanly
  let message = err.message;

  // Mongoose duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field ? field : 'Field'} already exists`;
    res.status(400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
    res.status(400);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = `Invalid ID format: ${err.value}`;
    res.status(400);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Stack trace only in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };