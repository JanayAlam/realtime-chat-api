// dependencies
const router = require('express').Router();

// controllers
const MessageController = require('../controllers/MessageController');

// middlewares
const isAuthorize = require('../middlewares/validateToken');
const isEmailValid = require('../middlewares/validateEmail');
const isActivated = require('../middlewares/isActivated');

// create new message
router.post(
    '/',
    isAuthorize,
    isEmailValid,
    isActivated,
    MessageController.sendMessage
);

// delete message
router.delete(
    '/:messageId',
    isAuthorize,
    isEmailValid,
    isActivated,
    MessageController.deleteMessage
);

module.exports = router;
