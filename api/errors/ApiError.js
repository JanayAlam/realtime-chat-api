class ApiError {
    /**
     * Constructor of Api Error Class
     *
     * @param {Number} status http status code
     * @param {String} message error message
     */
    constructor(status, message) {
        this.message = message;
        this.status = status;
    }

    /**
     * Error class creator for bad request error
     *
     * @param {String} msg Error message
     * @returns {Object} Object of ApiError class
     */
    static badRequest(msg) {
        return new ApiError(400, msg);
    }
}

module.exports = ApiError;
