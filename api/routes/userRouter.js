// dependencies
const router = require('express').Router();

// controllers
const UserController = require('../controllers/UserController');


router.get(
    '/duplicate-username/:username',
    UserController.checkIfTheUsernameAlreadyExists
);

router.get(
    '/duplicate-email/:email',
    UserController.checkIfTheEmailAlreadyExists
);

module.exports = router;
