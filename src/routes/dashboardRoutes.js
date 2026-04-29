const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');

router.get('/', ensureAuthenticated, getDashboard);

module.exports = router;
