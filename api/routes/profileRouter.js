// dependencies
const router = require('express').Router();

// controllers
const ProfileController = require('../controllers/ProfileController.js');

// validations
const profileDto = require('../dto/profileDtos/profileDto');
const nameDto = require('../dto/profileDtos/nameDto');
const statusDto = require('../dto/profileDtos/statusDto');
const dateOfBirthDto = require('../dto/profileDtos/dateOfBirthDto');
const genderDto = require('../dto/profileDtos/genderDto');
const regionDto = require('../dto/profileDtos/regionDto');

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
    '/',
    isAuthorize,
    validateDto(nameDto),
    validateDto(statusDto),
    validateDto(dateOfBirthDto),
    validateDto(regionDto),
    validateDto(genderDto),
    isEmailValid,
    isActivated,
    ProfileController.update
);

// deactivate user profile
router.patch(
    '/deactivate',
    isAuthorize,
    isEmailValid,
    isActivated,
    ProfileController.activeOrDeactiveProfile
);

// activate user profile
router.patch(
    '/activate',
    isAuthorize,
    isEmailValid,
    isDeactivated,
    ProfileController.activeOrDeactiveProfile
);

// Chnage profilePhoto
router.patch(
    '/profile-photo',
    isAuthorize,
    isEmailValid,
    isActivated,
    upload.single('profilePhoto'),
    ProfileController.changeProfilePhoto
);

// Remove profilePhoto
router.delete(
    '/profile-photo',
    isAuthorize,
    isEmailValid,
    isActivated,
    ProfileController.deleteProfilePhoto
);

/**
 * Show blockList the profile
 */
router.get(
    '/blocks/:id',
    isAuthorize,
    isEmailValid,
    isActivated,
    ProfileController.getBlockedProfileList
);

/**
 * Push blockList Profile
 * id: Id of the profile which to block
 */
router.patch(
    '/block/:id',
    isAuthorize,
    isEmailValid,
    isActivated,
    ProfileController.blockProfile
);

/**
 * Pull blockList Profile
 * id: Id of the profile which to unblock
 */
router.patch(
    '/unblock/:id',
    isAuthorize,
    isEmailValid,
    isActivated,
    ProfileController.unblockProfile
);

/**
 * Show all chat rooms
 * profileId: Id of the profile which chat rooms are going to show
 */
router.get(
    '/chat-rooms/:profileId',
    isAuthorize,
    isEmailValid,
    isActivated,
    ProfileController.getChatRooms
);

module.exports = router;
