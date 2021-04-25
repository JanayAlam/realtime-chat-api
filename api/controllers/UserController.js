// models
const User = require('../models/User');

// error
const ApiError = require('../errors/ApiError');

class UserController {

    /**
     * [GET] Check if the username already taken
     *
     * Search the database with provided username and response with the valid info
     *
     * @param {Request} req Request json object with a param value
     *  containing username.
     * @param {Response} res response object provided by express
     * @param {Function} next next middleware function provided by express
     */
    checkIfTheUsernameAlreadyExists = async (req, res, next) => {
        const { username } = req.params;

        try {
            const user = await User.findOne({username: username});

            // user found with that username
            if (user) {
                return next(ApiError.alreadyExists('Username already taken'));
            } else {
                return res.status(200).json({
                    message: 'No duplicate username',
                });
            }
        } catch (err) {
            return next(err);
        }
    }

    /**
     * [GET] Check if the email already taken
     *
     * Search the database with provided email and response with the valid info
     *
     * @param {Request} req Request json object with a param value
     *  containing email.
     * @param {Response} res response object provided by express
     * @param {Function} next next middleware function provided by express
     */
    checkIfTheEmailAlreadyExists = async (req, res, next) => {
        const { email } = req.params;

        try {
            const user = await User.findOne({email});

            // user found with that username
            if (user) {
                return next(ApiError.alreadyExists('Email already taken'));
            } else {
                return res.status(200).json({
                    message: 'No duplicate email',
                });
            }
        } catch (err) {
            return next(err);
        }
    }
}

module.exports = new UserController();
