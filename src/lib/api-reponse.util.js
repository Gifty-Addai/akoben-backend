class ApiResponse {
    /**
     * @param {boolean} success - Indicates if the operation was successful.
     * @param {string} message - A descriptive message.
     * @param {*} data - The payload containing data.
     */
    constructor(success, message, data = null) {
      this.success = success;
      this.message = message;
      this.data = data;
    }
  
    /**
     * Send a successful response.
     * @param {object} res - Express response object.
     * @param {string} message - Success message.
     * @param {*} data - Data to send.
     * @param {number} [statusCode=200] - HTTP status code.
     */
    static sendSuccess(res, message, data = null, statusCode = 200) {
      const response = new ApiResponse(true, message, data);
      return res.status(statusCode).json(response);
    }
  
    /**
     * Send an error response.
     * @param {object} res - Express response object.
     * @param {string} message - Error message.
     * @param {number} [statusCode=500] - HTTP status code.
     */
    static sendError(res, message, statusCode = 500) {
      const response = new ApiResponse(false, message, null);
      return res.status(statusCode).json(response);
    }
  }
  
  export default ApiResponse;
  