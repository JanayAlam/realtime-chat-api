// dependencies
const router = require('express').Router();

// controllers
const AuthController = require('../controllers/AuthController');

// validations
const userRegisterDto = require('../dto/authDtos/userRegisterDto');
const userLoginDto = require('../dto/authDtos/userLoginDto');

// middlewares
const validateDto = require('../middlewares/validateDto');

router.post(
    '/register',
    validateDto(userRegisterDto),
    AuthController.registerNewUser
);
router.patch('/email-verify', AuthController.verifyEmailToken);
router.post(
    '/login',
    validateDto(userLoginDto),
    AuthController.loginToExistingAccount
);

module.exports = router;
