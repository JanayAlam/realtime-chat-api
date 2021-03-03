// dependencies
const router = require('express').Router();

// controllers
const ProfileController = require('../controllers/ProfileController.js');

// validations
const profileDto = require('../dto/profileDto');

// middlewares
const isAuthorize = require('../middlewares/validateToken');
const isEmailValid = require('../middlewares/validateEmail');
const validateDto = require('../middlewares/validateDto');

router.post(
    '/',
    isAuthorize,
    isEmailValid,
    validateDto(profileDto),
    ProfileController.createProfile
);

module.exports = router;
