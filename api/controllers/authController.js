// models
const User = require('../models/User');

// error
const ApiError = require('../errors/ApiError');

// encryption
const bcrypt = require('bcrypt');

// utils
const { generateRandomString } = require('../../utils/generator');
const sendEmail = require('../../utils/emailSender');

class AuthController {
    /**
     * [POST] Register a new User
     *
     * Register a new user with their unique email and username.
     *
     * @param {Request} req request json object with a body.
     *  Body must contain username, password and email value.
     * @param {Response} res response object provided by express
     */
    registerNewUser = async (req, res) => {
        const { username, password, email } = req.body;
        try {
            // if the provided username is already used
            const previousUserWithUsername = await User.findOne({ username });
            if (previousUserWithUsername) {
                const error = ApiError.badRequest('Username already taken');
                return res.status(409).json(error);
            }

            // if the provided email is already used
            const previousUserWithEmail = await User.findOne({ email });
            if (previousUserWithEmail) {
                const error = ApiError.badRequest('Email already taken');
                return res.status(409).json(error);
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
            const responseData = {
                _id: createdUser._id,
                isEmailVerified: updcreatedUseratedUser.isEmailVerified,
                email: createdUser.email,
                username: createdUser.username,
            };

            // user created
            return res.status(201).json({
                user: responseData,
            });
        } catch (err) {
            // internal server error
            return res.status(500).json(err);
        }
    };

    /**
     * [PATCH] Verify The Token
     *
     * Verify the email token with the user's token
     *
     * @param {Request} req request object with a body
     *  {emailVerificationToken:String, _id:String}
     * @param {Response} res response object provided by express
     */
    verifyEmailToken = async (req, res) => {
        const { emailVerificationToken, _id } = req.body;

        // validation of the token
        if (!emailVerificationToken) {
            return res.status(400).json({
                message: 'Token is required',
            });
        }

        try {
            // fetching the user
            const user = await User.findById(_id);

            // if user not found
            if (!user) {
                return res.status(404).json({
                    message: 'User not found with the id',
                });
            }

            // checking if the user is already verified
            if (user.isEmailVerified) {
                return res.status(409).json({
                    message: 'Already verified',
                });
            }

            // compareing the token
            const isMatched = await bcrypt.compare(
                emailVerificationToken,
                user.emailVerificationToken
            );

            // if token did not match with the database's token
            if (!isMatched) {
                return res.status(400).json({
                    message: 'Token did not matched',
                });
            }

            // update the status of the verification of email
            const updatedUser = await User.findOneAndUpdate(
                _id,
                {
                    $set: { isEmailVerified: true },
                },
                { new: true }
            );

            // creating payload for sending to the client
            const responseData = {
                _id: updatedUser._id,
                isEmailVerified: updatedUser.isEmailVerified,
                email: updatedUser.email,
                username: updatedUser.username,
            };

            // all OK
            return res.status(200).json({
                user: responseData,
            });
        } catch (e) {
            return res.status(500).json(err);
        }
    };
}

module.exports = new AuthController();
