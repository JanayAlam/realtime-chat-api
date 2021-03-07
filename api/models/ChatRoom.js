const { Schema, model } = require('mongoose');

const chatRoomSchema = new Schema(
    {
        messages: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Message',
            },
        ],
        pairProfiles: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Profile',
            },
        ],
    },
    { timestamps: true }
);

const ChatRoom = model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;
