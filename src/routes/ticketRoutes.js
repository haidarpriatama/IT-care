const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authorizeRoles } = require('../middlewares/authMiddleware');
const {
  getTickets,
  getCreateTicket,
  postCreateTicket,
  getTicketDetail,
  getEditTicket,
  updateTicket,
  addNote,
  softDeleteTicket,
  getTrash,
  restoreTicket,
  hardDeleteTicket,
  getLogsApi,
} = require('../controllers/ticketController');

// Trash (admin only)
router.get('/trash', ensureAuthenticated, authorizeRoles('admin'), getTrash);
router.post('/:id/restore', ensureAuthenticated, authorizeRoles('admin'), restoreTicket);
router.delete('/:id/hard', ensureAuthenticated, authorizeRoles('admin'), hardDeleteTicket);

// CRUD Tickets
router.get('/api/logs', ensureAuthenticated, getLogsApi);
router.get('/', ensureAuthenticated, getTickets);
router.get('/create', ensureAuthenticated, authorizeRoles('admin', 'karyawan'), getCreateTicket);
router.post('/', ensureAuthenticated, authorizeRoles('admin', 'karyawan'), postCreateTicket);
router.get('/:id', ensureAuthenticated, getTicketDetail);
router.get('/:id/edit', ensureAuthenticated, getEditTicket);
router.put('/:id', ensureAuthenticated, updateTicket);
router.post('/:id/notes', ensureAuthenticated, addNote);
router.delete('/:id', ensureAuthenticated, softDeleteTicket);

module.exports = router;
