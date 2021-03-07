// models
const Profile = require('../models/Profile');
const ChatRoom = require('../models/ChatRoom');

// error
const ApiError = require('../errors/ApiError');

class ChatRoomController {
    /**
     * [POST] Create Chat Room
     *
     * @param {Request} req Request object with a body {id:TargetProfilesID}.
     * @param {Response} res Response object provided by express.
     * @param {Callback} next Callback function to call next middleware
     */
    createChatRoom = async (req, res, next) => {
        const { id } = req.body; // pair profile id
        try {
            // authorized profile
            const authorizedUserProfile = await Profile.findById(
                req.user.profile
            ).populate({
                path: 'chatRooms',
            });

            // authorized user want to create a room with target profile user
            const targetProfile = await Profile.findById(id).populate({
                path: 'chatRooms',
                select: 'pairProfiles',
            });

            // if not found
            if (!targetProfile) {
                return next(ApiError.notFound('Requested profile not found'));
            }

            // if user blocked by other one
            if (
                authorizedUserProfile.blockedProfiles.includes(
                    targetProfile._id
                ) ||
                targetProfile.blockedProfiles.includes(
                    authorizedUserProfile._id
                )
            ) {
                // profile is blocked
                return next(
                    ApiError.notAcceptable(
                        'Profile is blocked or you are blocked by them'
                    )
                );
            }

            // value = each chat room _id
            const stauts = authorizedUserProfile.chatRooms.filter((value) => {
                if (value.pairProfiles.includes(id)) {
                    return true;
                }
            });
            if (stauts) {
                return next(
                    ApiError.alreadyExists(
                        'Chat room already exists with requested profile'
                    )
                );
            }

            // ChatRoom payload
            const chatRoom = new ChatRoom({
                messages: [],
                pairProfiles: [req.user.profile, id],
            });

            // saving into the database
            const createdChatRoom = await chatRoom.save();

            // updating user profiles
            await Profile.findOneAndUpdate(
                { _id: req.user.profile },
                {
                    $push: { chatRooms: createdChatRoom._id },
                }
            );
            await Profile.findOneAndUpdate(
                { _id: id },
                {
                    $push: { chatRooms: createdChatRoom._id },
                }
            );

            // all OK
            return res.status(201).json(createdChatRoom);
        } catch (err) {
            return next(err);
        }
    };

    /**
     * [DELETE] Delete Chat Room
     *
     * @param {Request} req Request object provided by express.
     * @param {Response} res Response object provided by express.
     * @param {Callback} next Callback function to call next middleware
     */
    removeChatRoom = async (req, res, next) => {
        const { roomId } = req.params;
        try {
            // room
            const room = await ChatRoom.findById(roomId);

            if (!room.pairProfiles.includes(req.user.profile)) {
                return next(
                    ApiError.notFound('Profile has no such room created')
                );
            }

            // updating user profiles
            room.pairProfiles.forEach(async (value) => {
                await Profile.findOneAndUpdate(
                    { _id: value },
                    {
                        $pull: { chatRooms: roomId },
                    }
                );
            });

            await ChatRoom.findOneAndDelete({ _id: roomId });

            // all OK
            return res.status(200).json({
                message: 'Successfully removed chat room',
            });
        } catch (err) {
            return next(err);
        }
    };
}

module.exports = new ChatRoomController();
