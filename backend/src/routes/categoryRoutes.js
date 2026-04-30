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
router.post('/', ensureAuthenticated, authorizeRoles('admin', 'teknisi'), postCreateCategory);
router.put('/:id', ensureAuthenticated, authorizeRoles('admin', 'teknisi'), updateCategory);
router.delete('/:id', ensureAuthenticated, authorizeRoles('admin', 'teknisi'), deleteCategory);

module.exports = router;
