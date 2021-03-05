// error
const ApiError = require('../errors/ApiError');

// models
const Profile = require('../models/Profile');

/**
 * Check If Profile is Active or Not
 *
 * Block the request if profile is active
 *
 * @param {Request} req Request object provided by express.
 * @param {Response} res Response object provided by express.
 */
module.exports = async (req, res, next) => {
    try {
        const profile = await Profile.findById(req.user.profile);

        if (!profile) {
            return next(ApiError.notFound('Profile not found'));
        }

        if (!profile.isDeactivated) {
            return next(ApiError.notAcceptable('Profile is active'));
        }

        next();
    } catch (err) {
        return next(err);
    }
};
