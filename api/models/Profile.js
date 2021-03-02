const { Schema, model } = require('mongoose');

const profileSchema = new Schema({
    name: {
        type: String,
        trim: true,
        maxlength: 25,
        minlength: 3,
        required: true,
    },
    status: {
        type: String,
        trim: true,
        minlength: 5,
        maxlength: 100,
        required: false,
    },
    profilePhoto: {
        type: String,
        required: false,
    },
    blockedProfile: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Profile',
        },
    ],
    chatRooms: [
        {
            type: Schema.Types.ObjectId,
            ref: 'ChatRoom',
        },
    ],
    isDeactivated: {
        type: Boolean,
        default: true,
    },
});

const Profile = model('Profile', profileSchema);

module.exports = Profile;
