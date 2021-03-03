// dependencies
const router = require('express').Router();

// controllers
const AuthController = require('../controllers/AuthController');

// validation
const userDto = require('../dto/userDto');
const validateDto = require('../middlewares/validateDto');

router.post('/register', validateDto(userDto), AuthController.registerNewUser);
router.patch('/email-verify', AuthController.verifyEmailToken);
router.post('/login', AuthController.loginToExistingAccount);

module.exports = router;
