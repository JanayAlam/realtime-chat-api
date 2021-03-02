const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    username: {
        type: String,
        trim: true,
        maxlength: 8,
        minlength: 4,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
    },
    password: {
        type: String,
        minlength: 6,
        required: true,
    },
    emailVerificationToken: {
        type: String,
        required: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    profile: {
        type: Schema.Types.ObjectId,
        ref: 'Profile',
    },
});

const User = model('User', userSchema);

module.exports = User;
