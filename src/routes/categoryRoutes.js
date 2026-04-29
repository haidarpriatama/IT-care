const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authorizeRoles } = require('../middlewares/authMiddleware');
const {
  getCategories,
  getCreateCategory,
  postCreateCategory,
  getEditCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

router.get('/', ensureAuthenticated, getCategories);
router.get('/create', ensureAuthenticated, authorizeRoles('admin'), getCreateCategory);
router.post('/', ensureAuthenticated, authorizeRoles('admin'), postCreateCategory);
router.get('/:id/edit', ensureAuthenticated, authorizeRoles('admin'), getEditCategory);
router.put('/:id', ensureAuthenticated, authorizeRoles('admin'), updateCategory);
router.delete('/:id', ensureAuthenticated, authorizeRoles('admin'), deleteCategory);

module.exports = router;
