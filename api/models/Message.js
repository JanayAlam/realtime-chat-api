const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
    message: {
        type: String,
        requied: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const Message = model('Message', messageSchema);

module.exports = Message;
