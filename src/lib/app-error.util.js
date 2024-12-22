class AppError extends Error {
    constructor(success,status, message) {
      super(message);
      this.success = success;
      this.status = status;
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export default AppError;
  