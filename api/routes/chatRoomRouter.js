// dependencies
const router = require('express').Router();

// controllers
const ChatRoomController = require('../controllers/ChatRoomController');

// middlewares
const isAuthorize = require('../middlewares/validateToken');
const isEmailValid = require('../middlewares/validateEmail');
const isActivated = require('../middlewares/isActivated');

// create chat room
router.post(
    '/',
    isAuthorize,
    isEmailValid,
    isActivated,
    ChatRoomController.createChatRoom
);

// delete chat room
router.delete(
    '/:roomId',
    isAuthorize,
    isEmailValid,
    isActivated,
    ChatRoomController.removeChatRoom
);

// get all messages
router.get(
    '/messages/:roomId',
    isAuthorize,
    isEmailValid,
    isActivated,
    ChatRoomController.getMessages
);

module.exports = router;
