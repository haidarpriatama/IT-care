const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authorizeRoles } = require('../middlewares/authMiddleware');
const {
  getUsers,
  getCreateUser,
  postCreateUser,
  getEditUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

router.get('/', ensureAuthenticated, authorizeRoles('admin'), getUsers);
router.get('/create', ensureAuthenticated, authorizeRoles('admin'), getCreateUser);
router.post('/', ensureAuthenticated, authorizeRoles('admin'), postCreateUser);
router.get('/:id/edit', ensureAuthenticated, authorizeRoles('admin'), getEditUser);
router.put('/:id', ensureAuthenticated, authorizeRoles('admin'), updateUser);
router.delete('/:id', ensureAuthenticated, authorizeRoles('admin'), deleteUser);

module.exports = router;
