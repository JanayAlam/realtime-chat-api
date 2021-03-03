// models
const User = require('../models/User');

// error
const ApiError = require('../errors/ApiError');

// jwt
const jwt = require('jsonwebtoken');

// encryption
const bcrypt = require('bcrypt');

// config
const config = require('config');

// utils
const { generateRandomString } = require('../../utils/generator');
const sendEmail = require('../../utils/emailSender');
const ResponsePayload = require('../../utils/ResponsePayload');

class AuthController {
    /**
     * [POST] Register a new User
     *
     * Register a new user with their unique email and username.
     *
     * @param {Request} req Request json object with a body.
     *  Body must contain username, password and email value.
     * @param {Response} res response object provided by express
     */
    registerNewUser = async (req, res, next) => {
        const { username, password, email } = req.body;
        try {
            // if the provided username is already used
            const previousUserWithUsername = await User.findOne({ username });
            if (previousUserWithUsername) {
                return next(ApiError.alreadyExists('Username already taken'));
            }

            // if the provided email is already used
            const previousUserWithEmail = await User.findOne({ email });
            if (previousUserWithEmail) {
                return next(ApiError.alreadyExists('Email already taken'));
            }

            // hashing the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // generating token for the user
            const token = generateRandomString(4);

            // hashing the token (token is from utils.generator.js)
            const hashedToken = await bcrypt.hash(token, 10);

            // payload of user from model
            const user = new User({
                username,
                email,
                password: hashedPassword,
                emailVerificationToken: hashedToken,
            });

            // saving the user into database
            const createdUser = await user.save();

            // sending email
            sendEmail(email, token);

            // creating payload for sending to the client
            const responseData = ResponsePayload.userResponseDretails(
                createdUser
            );

            // user created
            return res.status(201).json({
                user: responseData,
            });
        } catch (err) {
            return next(err);
        }
    };

    /**
     * [PATCH] Verify The Token
     *
     * Verify the email token with the user's token
     *
     * @param {Request} req Request object with a body
     *  {emailVerificationToken:String, email:String}
     * @param {Response} res response object provided by express
     */
    verifyEmailToken = async (req, res, next) => {
        const { emailVerificationToken, email } = req.body;

        // validation of the token
        if (!emailVerificationToken) {
            return next(ApiError.badRequest('Token is required'));
        }

        try {
            // fetching the user
            const user = await User.findOne({ email });

            // if user not found
            if (!user) {
                return next(
                    ApiError.notFound('User not found with the provided email')
                );
            }

            // checking if the user is already verified
            if (user.isEmailVerified) {
                return next(ApiError.alreadyExists('Already verified'));
            }

            // compareing the token with the stored token in database
            const isMatched = await bcrypt.compare(
                emailVerificationToken,
                user.emailVerificationToken
            );

            // if token did not match with the database's token
            if (!isMatched) {
                return next(ApiError.notAcceptable('Token did not matched'));
            }

            // update the status of the verification of email
            const updatedUser = await User.findOneAndUpdate(
                { email },
                {
                    $set: { isEmailVerified: true },
                },
                { new: true }
            );

            // creating payload for sending to the client
            const responseData = ResponsePayload.userResponseDretails(
                updatedUser
            );

            // all OK
            return res.status(200).json({
                user: responseData,
            });
        } catch (err) {
            return next(err);
        }
    };

    /**
     * [POST] Login Controller
     *
     * Authorize the user with there provided email and password. If they are valid then
     *  it will give them a JSON Web Token for further authorization
     *
     * @param {Request} req Request object with a body {email:String, password:String}
     * @param {Response} res response object provided by express
     */
    loginToExistingAccount = async (req, res, next) => {
        const { email, password } = req.body;
        try {
            // fetching the user with the email
            const user = await User.findOne({ email });

            // if the user not found
            if (!user) {
                return next(ApiError.notFound('User not found with the email'));
            }

            // compareing the password with the stored password in database
            const isMatched = await bcrypt.compare(password, user.password);

            // if password is wrong
            if (!isMatched) {
                return next(ApiError.unAuthorized('Password did not matched'));
            }

            // creating a json web token for the user
            const token = jwt.sign(
                {
                    username: user.username,
                    isEmailVerified: user.isEmailVerified,
                    email: user.email,
                    profile: user.profile,
                    _id: user._id,
                },
                config.get('secret-key'),
                {
                    expiresIn: '2d',
                }
            );

            // creating payload for sending to the client
            const responseData = ResponsePayload.userResponseDretails(user);

            // all OK
            return res.status(200).json({
                user: responseData,
                token,
            });
        } catch (err) {
            return next(err);
        }
    };
}

module.exports = new AuthController();
