const express = require('express');
const router = express.Router();
const { postLogin, postRegister, postLogout, getMe } = require('../controllers/authController');

router.post('/login', postLogin);
router.post('/register', postRegister);
router.post('/logout', postLogout);
router.get('/me', getMe);

module.exports = router;
