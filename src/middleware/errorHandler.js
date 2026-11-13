function errorHandler(err, req, res, next) {
  console.error('Unhandled Server Error:', err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'An internal server error occurred',
    code: err.code || 'INTERNAL_ERROR'
  });
}

module.exports = errorHandler;

