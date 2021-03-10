// dependencies
const fs = require('fs');

// models
const User = require('../models/User');
const Profile = require('../models/Profile');
const ChatRoom = require('../models/ChatRoom');

// error
const ApiError = require('../errors/ApiError');

// utils
const ResponsePayload = require('../../utils/ResponsePayload');
const { kStringMaxLength } = require('buffer');

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
     * @param {Callback} next Callback function to call next middleware.
     */
    store = async (req, res, next) => {
        const userId = req.user._id;
        const { name, status, dateOfBirth, gender, region } = req.body;

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
                dateOfBirth,
                gender,
                region,
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
     * @param {Callback} next Callback function to call next middleware.
     */
    getProfiles = async (req, res, next) => {
        try {
            // fetching all the profiles from database
            const profiles = await Profile.find().populate({
                path: 'user',
                select: 'username email isEmailVerified',
            });

            // authorized user profile
            const userProfile = await Profile.findById(req.user.profile);

            // removing all blocklist people
            const responseProfiles = profiles.filter((value) => {
                if (!userProfile.blockedProfiles.includes(value._id)) {
                    if (!value.blockedProfiles.includes(userProfile._id)) {
                        return true;
                    }
                }
            });

            // all OK
            return res.status(200).json({
                message: 'Profiles fetched successfully',
                profiles: responseProfiles,
            });
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
     * @param {Callback} next Callback function to call next middleware.
     */
    getProfile = async (req, res, next) => {
        const { id } = req.params;
        try {
            // fetching the profile
            const profile = await Profile.findById(id).populate({
                path: 'user',
                select: 'username email isEmailVerified',
            });

            // user profile
            const userProfile = await Profile.findById(
                req.user.profile
            ).populate({
                path: 'user',
                select: 'username email isEmailVerified',
            });

            // if profile isn't in the database
            if (!profile) {
                return next(
                    ApiError.notFound('Profile not found with the provided ID')
                );
            }

            if (
                userProfile.blockedProfiles.includes(profile._id) ||
                profile.blockedProfiles.includes(userProfile._id)
            ) {
                // profile is blocked
                return next(
                    ApiError.notAcceptable(
                        'Profile is blocked or you are blocked by them'
                    )
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
     *  Body must contain either name or status or dateOfBirth or region or gender or all of them.
     *  User must be authorized for performing this request.
     * @param {Response} res Response object provided by express.
     * @param {Callback} next Callback function to call next middleware.
     */
    update = async (req, res, next) => {
        let { name, status, dateOfBirth, region, gender } = req.body;

        try {
            // fetching the profile
            const profile = await Profile.findById(req.user.profile);

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
            if (!dateOfBirth) {
                dateOfBirth = profile.dateOfBirth;
            }
            if (!region) {
                region = profile.region;
            }
            if (!gender) {
                gender = profile.gender;
            }

            // update that profile on database
            const updatedProfile = await Profile.findOneAndUpdate(
                { _id: profile._id },
                { $set: { name, status } },
                { new: true }
            ).populate({
                path: 'user',
                select: 'username email isEmailVerified',
            });

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
     * @param {Callback} next Callback function to call next middleware.
     */
    activeOrDeactiveProfile = async (req, res, next) => {
        const id = req.user.profile;
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
     * @param {Request} req Request object with multipart form type body with a image {profilePhoto:Image}.
     * @param {Response} res Response object provided by express.
     * @param {Callback} next Callback function to call next middleware.
     */
    changeProfilePhoto = async (req, res, next) => {
        const id = req.user.profile;
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
     * Fetch a specific profile with profile id and delete it's profile photo
     *
     * @param {Request} req Request object provided by express.
     * @param {Response} res Response object provided by express.
     * @param {Callback} next Callback function to call next middleware.
     */
    deleteProfilePhoto = async (req, res, next) => {
        const id = req.user.profile;
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

    /**
     * [PATCH] Block Profile
     *
     * Request uri must have target profile id and user must be authorized.
     *
     * @param {Request} req Request object provided by express.
     * @param {Response} res Response object provided by express.
     * @param {Callback} next Callback function to call next middleware.
     */
    blockProfile = async (req, res, next) => {
        const { id } = req.params;
        const profileId = req.user.profile;
        try {
            // which profile to block
            const targetProfile = await Profile.findById(id);

            // block by whom
            const userProfile = await Profile.findById(profileId);

            // id target profile not found
            if (!targetProfile) {
                return next(
                    ApiError.notFound(
                        'Profile not found with the id which was provided by the user'
                    )
                );
            }

            // if user profile not found
            if (!userProfile) {
                return next(ApiError.notFound('Authorized profile not found'));
            }

            // already blocked
            if (userProfile.blockedProfiles.includes(id)) {
                return next(
                    ApiError.notAcceptable('Already blocked this profile')
                );
            }

            // updating the profile
            const profile = await Profile.findOneAndUpdate(
                { _id: profileId },
                { $push: { blockedProfiles: targetProfile } },
                { new: true }
            );

            // all OK
            return res.status(200).json({
                message: 'Added to blocklist',
                profile,
            });
        } catch (e) {
            return next(e);
        }
    };

    /**
     * [PATCH] Unblock Profile
     *
     * Request uri must have target profile id and user must be authorized.
     *
     * @param {Request} req Request object provided by express.
     * @param {Response} res Response object provided by express.
     * @param {Callback} next Callback function to call next middleware.
     */
    unblockProfile = async (req, res, next) => {
        const { id } = req.params;
        const profileId = req.user.profile;
        try {
            // which profile to unblock
            const targetProfile = await Profile.findById(id);

            // unblock from which profile
            const userProfile = await Profile.findById(profileId);

            // id target profile not found
            if (!targetProfile) {
                return next(
                    ApiError.notFound(
                        'Profile not found with the id which was provided by the user'
                    )
                );
            }

            // if user profile not found
            if (!userProfile) {
                return next(ApiError.notFound('Authorized profile not found'));
            }

            console.log(userProfile, targetProfile);

            // not blocked
            if (!userProfile.blockedProfiles.includes(id)) {
                return next(
                    ApiError.notAcceptable(
                        'Cannot unblock a profile which is not blocked'
                    )
                );
            }

            // updating the profile
            const profile = await Profile.findOneAndUpdate(
                { _id: profileId },
                { $pull: { blockedProfiles: targetProfile._id } },
                { new: true }
            );

            // all OK
            return res.status(200).json({
                message: 'Successfully unblocked the profile',
                profile,
                unblockedProfile: targetProfile,
            });
        } catch (err) {
            return next(err);
        }
    };

    /**
     * [GET] Get Chat Rooms
     *
     * Request uri must have chat room id and user must be authorized.
     *
     * @param {Request} req Request object provided by express.
     * @param {Response} res Response object provided by express.
     * @param {Callback} next Callback function to call next middleware.
     */
    getAllChatRoom = async (req, res, next) => {
        const { profileId } = req.params;
        try {
            // fetching the profile with chat rooms
            const profile = await Profile.findById(profileId).populate(
                'ChatRoom'
            );

            // if profile not found
            if (!profile) {
                return next(ApiError.notFound('Profile not found'));
            }

            // if user has no permission over this request
            if (!req.user.profile.equals(profileId)) {
                return next(
                    ApiError.notAcceptable(
                        'You have no permission for this request'
                    )
                );
            }

            // response array
            let responsePayload = new Array();

            for (let i = 0; i < profile.chatRooms.length; i++) {
                const room = await ChatRoom.findById(profile.chatRooms[i]);

                // filtering out the pair profile id
                const pairProfileId = room.pairProfiles[0].equals(
                    req.user.profile
                )
                    ? room.pairProfiles[1]
                    : room.pairProfiles[0];

                // single payload
                const payload = {
                    pariProfile: await Profile.findById(pairProfileId),
                    _id: room._id,
                };

                // pushing the payload
                responsePayload.push(payload);
            }

            // all OK
            return res.status(200).json({
                message: 'Successfully showing all chat rooms',
                chatRooms: responsePayload,
            });
        } catch (err) {
            return next(err);
        }
    };
}

module.exports = new ProfileController();
