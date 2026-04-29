const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authorizeRoles } = require('../middlewares/authMiddleware');
const {
  getCategories,
  postCreateCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

router.get('/', ensureAuthenticated, getCategories);
router.post('/', ensureAuthenticated, authorizeRoles('admin'), postCreateCategory);
router.put('/:id', ensureAuthenticated, authorizeRoles('admin'), updateCategory);
router.delete('/:id', ensureAuthenticated, authorizeRoles('admin'), deleteCategory);

module.exports = router;
