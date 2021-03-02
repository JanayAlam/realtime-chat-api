const { Schema, model } = require('mongoose');

const chatRoomSchema = new Schema({
    messages: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Message',
        },
    ],
});

const ChatRoom = model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;
