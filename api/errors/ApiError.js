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

    /**
     * Error class creator for unauthorized error
     *
     * @param {String} msg Error message
     * @returns {Object} Object of ApiError class
     */
    static unAuthorized(msg) {
        return new ApiError(401, msg);
    }

    /**
     * Error class creator for not found error
     *
     * @param {String} msg Error message
     * @returns {Object} Object of ApiError class
     */
    static notFound(msg) {
        return new ApiError(404, msg);
    }

    /**
     * Error class creator for already exists things
     *
     * @param {String} msg Error message
     * @returns {Object} Object of ApiError class
     */
    static alreadyExists(msg) {
        return new ApiError(409, msg);
    }

    /**
     * Error class creator for not acceptable request
     *
     * @param {String} msg Error message
     * @returns {Object} Object of ApiError class
     */
    static notAcceptable(msg) {
        return new ApiError(406, msg);
    }
}

module.exports = ApiError;
