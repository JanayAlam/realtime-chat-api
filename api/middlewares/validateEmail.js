// error
const ApiError = require('../errors/ApiError');

module.exports = (req, res, next) => {
    try {
        if (!req.user.isEmailVerified) {
            return next(ApiError.notAcceptable('Email must be verified'));
        }
        next();
    } catch (err) {
        return next(err);
    }
};
