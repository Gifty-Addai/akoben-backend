import AppError from '../lib/app-error.util.js';

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (!(err instanceof AppError)) {
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }

  res.status(err.status).json({
    status: 'error',
    message: err.message,
  });
};

export default errorHandler;
