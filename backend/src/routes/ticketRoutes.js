const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authorizeRoles } = require('../middlewares/authMiddleware');
const {
  getTickets,
  postCreateTicket,
  getTicketDetail,
  updateTicket,
  addNote,
  softDeleteTicket,
  getTrash,
  restoreTicket,
  hardDeleteTicket,
  getLogsApi,
} = require('../controllers/ticketController');

// Trash (admin only)
router.get('/trash/all', ensureAuthenticated, authorizeRoles('admin'), getTrash);
router.post('/:id/restore', ensureAuthenticated, authorizeRoles('admin'), restoreTicket);
router.delete('/:id/hard', ensureAuthenticated, authorizeRoles('admin'), hardDeleteTicket);

// CRUD Tickets
router.get('/api/logs', ensureAuthenticated, getLogsApi);
router.get('/', ensureAuthenticated, getTickets);
router.post('/', ensureAuthenticated, authorizeRoles('admin', 'karyawan'), postCreateTicket);
router.get('/:id', ensureAuthenticated, getTicketDetail);
router.put('/:id', ensureAuthenticated, updateTicket);
router.post('/:id/notes', ensureAuthenticated, addNote);
router.delete('/:id', ensureAuthenticated, softDeleteTicket);

module.exports = router;
