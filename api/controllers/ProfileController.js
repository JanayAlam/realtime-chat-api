const { json } = require('express');

class ProfileController {
    createProfile = async (req, res, next) => {
        return res.status(200).json(req.user);
    };
}

module.exports = new ProfileController();
