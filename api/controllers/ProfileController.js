// models
const User = require('../models/User');
const Profile = require('../models/Profile');

// error
const ApiError = require('../errors/ApiError');
const { findOneAndUpdate } = require('../models/User');

// utils
const ResponsePayload = require('../../utils/ResponsePayload');

class ProfileController {
    /**
     * [POST] Create a new Profile
     *
     * @param {Request} req Request json object with a body.
     *  Body must contain name or status which is not required. User must be authorized
     *  for performing this request.
     * @param {Response} res Response object provided by express.
     */
    createProfile = async (req, res, next) => {
        const userId = req.user._id;
        const { name, status } = req.body;

        try {
            const user = await User.findById(userId);
            if (user.profile) {
                return next(ApiError.alreadyExists('Profile already exists'));
            }

            // creating profile payload
            const profile = new Profile({
                user: userId,
                name,
                status,
                blockedProfiles: [],
                chatRooms: [],
            });

            // saving profile into the database
            const createdProfile = await profile.save();

            // updating the user schema
            const updatedUser = await User.findOneAndUpdate(
                { _id: userId },
                { $set: { profile: createdProfile._id } },
                { new: true }
            );

            // response payload
            const userResponsePayload = ResponsePayload.userResponseDretails(
                updatedUser
            );

            // all OK
            return res
                .status(201)
                .json({ user: userResponsePayload, profile: createdProfile });
        } catch (err) {
            return next(err);
        }
    };
}

module.exports = new ProfileController();
