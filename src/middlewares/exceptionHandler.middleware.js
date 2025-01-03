import ApiResponse from '../lib/api-reponse.util.js';
import AppError from '../lib/app-error.util.js';

const errorHandler = (err, req, res, next) => {
  console.error(err);

  const message = err.isOperational ? err.message : "Internal Server Error"
  if (!(err instanceof AppError)) {
    return ApiResponse.sendError(res, message, err.status || 500);

  }
  return ApiResponse.sendError(res, message, err.status);

};

export default errorHandler;
