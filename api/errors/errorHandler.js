const ApiError = require('./ApiError');

function apiErrorHandler(error, req, res, next) {
    if (error instanceof ApiError) {
        return res.status(error.status).json({ message: error.message });
    }
    console.log(error);
    return res.status(500).json('Something went wrong');
}

module.exports = apiErrorHandler;
