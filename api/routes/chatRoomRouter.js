// dependencies
const router = require('express').Router();

// controllers
const ChatRoomController = require('../controllers/ChatRoomController');

// middlewares
const isAuthorize = require('../middlewares/validateToken');
const isEmailValid = require('../middlewares/validateEmail');

// create chat room
router.post('/', isAuthorize, isEmailValid, ChatRoomController.createChatRoom);
router.delete(
    '/:roomId',
    isAuthorize,
    isEmailValid,
    ChatRoomController.removeChatRoom
);

module.exports = router;
