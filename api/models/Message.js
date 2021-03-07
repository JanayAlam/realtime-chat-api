const { Schema, model } = require('mongoose');

const messageSchema = new Schema(
    {
        message: {
            type: String,
            required: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'profile',
            required: true,
        },
    },
    { timestamps: true }
);

const Message = model('Message', messageSchema);

module.exports = Message;
