// dependencies
const jwt = require('jsonwebtoken');
const config = require('config');

// error
const ApiError = require('../errors/ApiError');

module.exports = (req, res, next) => {
    try {
        const rawToken = req.headers.authorization;

        // is the headers does have Authorization header
        if (!rawToken) {
            next(ApiError.unAuthorized('Unauthorized Request'));
        }

        // if token header does not includes Bearer word
        if (!rawToken.includes('Bearer ')) {
            next(
                ApiError.unAuthorized("'Bearer' keyword needed in token header")
            );
        }

        // split out the breaer word from the token
        const token = rawToken.split(' ')[1];

        // verifying the token with secret key
        jwt.verify(token, config.get('secret-key'), (error, decode) => {
            // if token did not matched
            if (error) {
                return next(ApiError.unAuthorized('Token did not matched'));
            }

            // binding user with te request object
            req.user = decode;

            // permited
            next();
        });
    } catch (err) {
        return next(err);
    }
};
