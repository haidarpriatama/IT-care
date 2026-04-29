const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authorizeRoles } = require('../middlewares/authMiddleware');
const { getReports } = require('../controllers/reportController');

router.get('/', ensureAuthenticated, authorizeRoles('admin'), getReports);

module.exports = router;
