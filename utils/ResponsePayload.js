class ResponsePayload {
    /**
     * User Response Payload
     *
     * Return a new object based on the provided object
     *
     * @param {Object} user user object
     */
    static userResponseDretails(user) {
        return {
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            _id: user._id,
            profile: user.profile || null,
            username: user.username,
        };
    }
}

module.exports = ResponsePayload;
