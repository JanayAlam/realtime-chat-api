// models
const Profile = require('../models/Profile');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');

// error
const ApiError = require('../errors/ApiError');

class MessageController {
    /**
     * [POST] Create Message
     *
     * @param {Request} req Request object with a body {messageText:string, roomId:ID}.
     * @param {Response} res Response object provided by express.
     * @param {Callback} next Callback function to call next middleware
     */
    sendMessage = async (req, res, next) => {
        const { roomId, messageText } = req.body;

        // validation
        if (!messageText) {
            return next(ApiError.notAcceptable('Message field is required'));
        }

        try {
            // authorized user profile
            const authorizedUserProfile = await Profile.findById(
                req.user.profile
            );
            if (!authorizedUserProfile.chatRooms.includes(roomId)) {
                return next(
                    ApiError.notFound('No such room found in profile id')
                );
            }

            // checking if the room isn't in the database
            const room = await ChatRoom.findById(roomId);
            if (!room) {
                return next(ApiError.notFound('Room not found'));
            }

            // receiver profile
            const targetProfileId = room.pairProfiles.filter((value) => {
                if (value !== authorizedUserProfile._id) {
                    return true;
                }
            });
            const targetProfile = await Profile.findById(targetProfileId);

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

            // message object payload
            const message = new Message({
                message: messageText,
                sender: req.user.profile,
                chatRoom: roomId,
            });

            // saving into database
            const createdMessage = await message.save();

            // updating the chat room
            const updatedRoom = await ChatRoom.findOneAndUpdate(
                { _id: roomId },
                {
                    $push: { messages: createdMessage._id },
                },
                { new: true }
            );

            const responseMessage = await Message.findById(
                createdMessage._id
            ).populate({
                path: 'sender',
                select: 'profilePhoto name',
            });

            // all OK
            return res.status(201).json({
                message: 'Message created successfully',
                messageObject: responseMessage,
                chatRoom: updatedRoom,
            });
        } catch (err) {
            return next(err);
        }
    };

    /**
     * [DELETE] Delete Message
     *
     * @param {Request} req Request object provided by express.
     * @param {Response} res Response object provided by express.
     * @param {Callback} next Callback function to call next middleware
     */
    deleteMessage = async (req, res, next) => {
        const { messageId } = req.params;
        try {
            // fetching the message from database
            const message = await Message.findById(messageId);
            if (!message) {
                return next(ApiError.notFound('Message not found'));
            }

            // message owner validation
            if (!req.user.profile.equals(message.sender)) {
                return next(
                    ApiError.notAcceptable(
                        'No permission for delete this message'
                    )
                );
            }

            // deleting the message from database
            await Message.findOneAndDelete({ _id: message._id });

            // updating the chat room
            const chatRoom = await ChatRoom.findOneAndUpdate(
                { _id: message.chatRoom },
                {
                    $pull: { messages: message._id },
                },
                { new: true }
            );

            // all OK
            return res.status(200).json({
                message: 'Successfully deleted the message',
                chatRoom,
            });
        } catch (err) {
            return next(err);
        }
    };
}

module.exports = new MessageController();
