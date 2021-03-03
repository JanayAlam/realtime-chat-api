// dependencies
const router = require('express').Router();

// controllers
const ProfileController = require('../controllers/ProfileController.js');

// validation

// middlewares
const isAuthorize = require('../middlewares/validateToken');

router.post('/', isAuthorize, ProfileController.createProfile);

module.exports = router;
