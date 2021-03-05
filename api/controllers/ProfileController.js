// dependencies
const fs = require('fs');

// models
const User = require('../models/User');
const Profile = require('../models/Profile');

// error
const ApiError = require('../errors/ApiError');

// utils
const ResponsePayload = require('../../utils/ResponsePayload');

class ProfileController {
    /**
     * Unlink The Photo From Storage
     *
     * @param {String} img Old photo path
     * @returns {Error|null}
     */
    _unlinkProfilePhoto = (img) => {
        if (img !== '/uploads/default.png') {
            fs.unlink(`public${img}`, (error) => {
                if (error) {
                    return error;
                }
                return null;
            });
        }
    };

    /**
     * [POST] Create a new Profile
     *
     * @param {Request} req Request json object with a body.
     *  Body must contain name or status which is not required. User must be authorized
     *  for performing this request.
     * @param {Response} res Response object provided by express.
     */
    store = async (req, res, next) => {
        const userId = req.user._id;
        const { name, status } = req.body;

        try {
            // fetching user
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
            return res.status(201).json({
                message: 'Profile created successfully',
                user: userResponsePayload,
                profile: createdProfile,
            });
        } catch (err) {
            return next(err);
        }
    };

    /**
     * [GET] Fetch All Profiles
     *
     * @param {Request} req Request object provided by express. User must be authorized
     *  for performing this request.
     * @param {Response} res Response object provided by express.
     */
    getProfiles = async (req, res, next) => {
        try {
            // fetching all the profiles from database
            const profiles = await Profile.find().populate({
                path: 'user',
                select: 'username email isEmailVerified',
            });

            // all OK
            return res
                .status(200)
                .json({ message: 'Profiles fetched successfully', profiles });
        } catch (err) {
            return next(err);
        }
    };

    /**
     * [GET] Fetch A Profile
     *
     * Fetch a specific profile with profile id. User must be authorized
     *  for performing this request.
     *
     * @param {Request} req Request object provided by express.
     * @param {Response} res Response object provided by express.
     */
    getProfile = async (req, res, next) => {
        const { id } = req.params;
        try {
            // fetching the profile
            const profile = await Profile.findById(id).populate({
                path: 'user',
                select: 'username email isEmailVerified',
            });

            // if profile isn't in the database
            if (!profile) {
                return next(
                    ApiError.notFound('Profile not found with the provided ID')
                );
            }

            // all OK
            return res
                .status(200)
                .json({ message: 'Profile fetched successfully', profile });
        } catch (err) {
            return next(err);
        }
    };

    /**
     * [PUT] Edit A Profile
     *
     * Fetch a specific profile with profile id and update it with provided body
     *
     * @param {Request} req Request json object with a body.
     *  Body must contain either name or status or both. User must be authorized
     *  for performing this request.
     * @param {Response} res Response object provided by express.
     */
    update = async (req, res, next) => {
        const { id } = req.params;
        let { name, status } = req.body;
        try {
            // fetching the profile
            const profile = await Profile.findById(id);

            // if profile isn't in the database
            if (!profile) {
                return next(
                    ApiError.notFound('Profile not found with the provided ID')
                );
            }

            // updating name and status
            if (!name) {
                name = profile.name;
            }
            if (!status) {
                status = profile.status;
            }

            // update that profile on database
            const updatedProfile = await Profile.findOneAndUpdate(
                { _id: id },
                { $set: { name, status } },
                { new: true }
            );

            // all OK
            return res.status(200).json({
                message: 'Profile updated successfully',
                profile: updatedProfile,
            });
        } catch (err) {
            return next(err);
        }
    };

    /**
     * [PATCH] Deactive or Activate the Profile
     *
     * Fetch a specific profile with profile id and active or deactive it
     *
     * @param {Request} req Request object provided by express.
     * @param {Response} res Response object provided by express.
     */
    activeOrDeactiveProfile = async (req, res, next) => {
        const { id } = req.params;
        try {
            // fetching and updating
            const profile = await Profile.findById(id);

            // if profile isn't in the database
            if (!profile) {
                return next(
                    ApiError.notFound('Profile not found with the provided ID')
                );
            }

            // updating
            const updatedProfile = await Profile.findOneAndUpdate(
                { _id: id },
                { $set: { isDeactivated: !profile.isDeactivated } },
                { new: true }
            );

            // all OK
            return res.status(200).json({
                message: 'Profile active status changed successfully',
                profile: updatedProfile,
            });
        } catch (err) {
            return next(err);
        }
    };

    /**
     * [PATCH] Change Profile Photo
     *
     * Fetch a specific profile with profile id and update its profile photo
     *
     * @param {Request} req Request object with multipart form type body with a image {profilePhoto}.
     * @param {Response} res Response object provided by express.
     */
    changeProfilePhoto = async (req, res, next) => {
        const { id } = req.params;
        try {
            // photo url
            const profilePhoto = `/uploads/${req.file.filename}`;

            // fetching
            const profile = await Profile.findById(id);

            // if profile isn't in the database
            if (!profile) {
                return next(
                    ApiError.notFound('Profile not found with the provided ID')
                );
            }

            // old profile photo path
            const oldPhoto = profile.profilePhoto;

            // deleting old photo from storage
            const unlinkPhotoError = this._unlinkProfilePhoto(oldPhoto);

            // throwing error if there was problem in deleting the photo
            if (unlinkPhotoError) {
                return next(unlinkPhotoError);
            }

            // updating
            const updatedProfile = await Profile.findOneAndUpdate(
                { _id: id },
                {
                    $set: { profilePhoto },
                },
                { new: true }
            );

            // all OK
            return res.status(200).json({
                message: 'Profile photo uploaded successfully',
                profile: updatedProfile,
            });
        } catch (err) {
            return next(err);
        }
    };

    /**
     * [DELETE] Delete Profile Photo
     *
     * Fetch a specific profile with profile id and delete its profile photo
     *
     * @param {Request} req Request object provided by express.
     * @param {Response} res Response object provided by express.
     */
    deleteProfilePhoto = async (req, res, next) => {
        const { id } = req.params;
        try {
            // fetching
            const profile = await Profile.findById(id);

            // if profile isn't in the database
            if (!profile) {
                return next(
                    ApiError.notFound('Profile not found with the provided ID')
                );
            }

            // old profile photo path
            const oldPhoto = profile.profilePhoto;

            // deleting old photo from storage
            const unlinkPhotoError = this._unlinkProfilePhoto(oldPhoto);

            // throwing error if there was problem in deleting the photo
            if (unlinkPhotoError) {
                return next(unlinkPhotoError);
            }

            // updating
            const updatedProfile = await Profile.findOneAndUpdate(
                { _id: id },
                {
                    $set: { profilePhoto: '/uploads/default.png' },
                },
                { new: true }
            );

            // all OK
            return res.status(200).json({
                message: 'Profile photo deleted successfully',
                profile: updatedProfile,
            });
        } catch (err) {
            return next(err);
        }
    };
}

module.exports = new ProfileController();
