// error
const ApiError = require('../errors/ApiError');

// models
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            next(ApiError.notFound('User not found'));
        }

        if (!user.isEmailVerified) {
            return next(ApiError.notAcceptable('Email must be verified'));
        }
        
        req.user = user;
        next();
    } catch (err) {
        return next(err);
    }
};
