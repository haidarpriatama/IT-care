const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authorizeRoles } = require('../middlewares/authMiddleware');
const {
  getUsers,
  postCreateUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

router.get('/', ensureAuthenticated, authorizeRoles('admin'), getUsers);
router.post('/', ensureAuthenticated, authorizeRoles('admin'), postCreateUser);
router.put('/:id', ensureAuthenticated, authorizeRoles('admin'), updateUser);
router.delete('/:id', ensureAuthenticated, authorizeRoles('admin'), deleteUser);

module.exports = router;
