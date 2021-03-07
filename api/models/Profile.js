const { Schema, model } = require('mongoose');

const profileSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
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
        dateOfBirth: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            trim: true,
            required: true,
        },
        region: {
            type: String,
            trim: true,
            required: true,
        },
        profilePhoto: {
            type: String,
            required: false,
            default: '/uploads/default.png',
        },
        blockedProfiles: [
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
            default: false,
        },
    },
    { timestamps: true }
);

const Profile = model('Profile', profileSchema);

module.exports = Profile;
