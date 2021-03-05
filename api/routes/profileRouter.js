// dependencies
const router = require('express').Router();

// controllers
const ProfileController = require('../controllers/ProfileController.js');

// validations
const profileDto = require('../dto/profileDtos/profileDto');
const nameDto = require('../dto/profileDtos/nameDto');
const statusDto = require('../dto/profileDtos/statusDto');

// middlewares
const isAuthorize = require('../middlewares/validateToken');
const isEmailValid = require('../middlewares/validateEmail');
const validateDto = require('../middlewares/validateDto');
const isDeactivated = require('../middlewares/isDeactivated');
const isActivated = require('../middlewares/isActivated');

// utils
const upload = require('../../utils/multerConfig');

// create profile
router.post(
    '/',
    isAuthorize,
    isEmailValid,
    validateDto(profileDto),
    ProfileController.store
);

// get all profiles
router.get(
    '/',
    isAuthorize,
    isEmailValid,
    isActivated,
    ProfileController.getProfiles
);

// get user profile
router.get(
    '/:id',
    isAuthorize,
    isEmailValid,
    isActivated,
    ProfileController.getProfile
);

// edit user profile (name or status)
router.put(
    '/:id',
    isAuthorize,
    validateDto(nameDto),
    validateDto(statusDto),
    isEmailValid,
    isActivated,
    ProfileController.update
);

// deactivate user profile
router.patch(
    '/deactivate/:id',
    isAuthorize,
    isEmailValid,
    isActivated,
    ProfileController.activeOrDeactiveProfile
);

// activate user profile
router.patch(
    '/activate/:id',
    isAuthorize,
    isEmailValid,
    isDeactivated,
    ProfileController.activeOrDeactiveProfile
);

// Chnage profilePhoto - PATCH
router.patch(
    '/profile-photo/:id',
    isAuthorize,
    isEmailValid,
    isActivated,
    upload.single('profilePhoto'),
    ProfileController.changeProfilePhoto
);

// Remove profilePhoto - PATCH
router.delete(
    '/profile-photo/:id',
    isAuthorize,
    isEmailValid,
    isActivated,
    ProfileController.deleteProfilePhoto
);

// 6. Push blockList Profile - PATCH
// 7. Pull blockList Profile - PATCH

module.exports = router;
