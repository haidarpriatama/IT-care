const pool = require('../config/db');

// GET /api/tickets
const getTickets = async (req, res) => {
  const user = req.session.user;
  const { search = '', status = '', priority = '', page = 1 } = req.query;
  const limit = 10;
  const offset = (parseInt(page) - 1) * limit;

  try {
    let baseQuery = `
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users tech ON t.technician_id = tech.id
      WHERE t.deleted_at IS NULL
    `;
    const params = [];
    let paramIndex = 1;

    // Role filter
    if (user.role === 'karyawan') {
      baseQuery += ` AND t.user_id = $${paramIndex++}`;
      params.push(user.id);
    }
    // teknisi dan admin bisa melihat semua tiket, jadi tidak perlu difilter user id atau technician id
    // Jika ada kebutuhan filter by technician di UI, bisa gunakan parameter tambahan nanti.

    if (search) {
      baseQuery += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex} OR t.ticket_number ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (status) {
      baseQuery += ` AND t.status = $${paramIndex++}`;
      params.push(status);
    }
    if (priority) {
      baseQuery += ` AND t.priority = $${paramIndex++}`;
      params.push(priority);
    }

    const countResult = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    const dataParams = [...params, limit, offset];
    const tickets = await pool.query(
      `SELECT t.id, t.ticket_number, t.title, t.status, t.priority, t.created_at, t.location,
              u.name AS requester, c.name AS category, tech.name AS technician
       ${baseQuery}
       ORDER BY t.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      dataParams
    );

    res.json({
      tickets: tickets.rows,
      currentPage: parseInt(page),
      totalPages,
      total,
    });
  } catch (err) {
    console.error('Tickets error:', err);
    res.status(500).json({ error: 'Gagal memuat data tiket.' });
  }
};

// Helper function to generate ticket number
const generateTicketNumber = async (categoryId, priority) => {
  // Get category initial
  let categoryPrefix = 'XX';
  if (categoryId) {
    const catResult = await pool.query('SELECT name FROM categories WHERE id = $1', [categoryId]);
    if (catResult.rows.length > 0) {
      const catName = catResult.rows[0].name.toUpperCase();
      // Get first two characters of category name, or pad with X
      categoryPrefix = (catName.replace(/[^A-Z]/g, '') + 'XX').substring(0, 2);
    }
  }

  // Priority mapping (0: low, 1: medium, 2: high)
  let priorityCode = '1'; // Default medium
  if (priority === 'low') priorityCode = '0';
  if (priority === 'high') priorityCode = '2';

  // Get sequence number for today/this category
  const countResult = await pool.query('SELECT COUNT(*) FROM tickets');
  const nextSeq = parseInt(countResult.rows[0].count) + 1;
  const seqPadded = nextSeq.toString().padStart(4, '0');

  return `${categoryPrefix}${priorityCode}${seqPadded}`;
};

// POST /api/tickets
const postCreateTicket = async (req, res) => {
  const user = req.session.user;
  const { category_id, title, description, location, priority } = req.body;
  try {
    const ticketPriority = priority || 'medium';
    const ticketNumber = await generateTicketNumber(category_id, ticketPriority);

    const result = await pool.query(
      `INSERT INTO tickets (user_id, category_id, title, description, location, priority, ticket_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user.id, category_id || null, title, description, location, ticketPriority, ticketNumber]
    );
    // Log status awal
    await pool.query(
      `INSERT INTO status_logs (ticket_id, changed_by, old_status, new_status) VALUES ($1, $2, $3, $4)`,
      [result.rows[0].id, user.id, null, 'open']
    );
    res.status(201).json({ message: 'Tiket berhasil dibuat.', ticket: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal membuat tiket.' });
  }
};

// GET /api/tickets/:id
const getTicketDetail = async (req, res) => {
  const user = req.session.user;
  const { id } = req.params;
  try {
    const ticketResult = await pool.query(`
      SELECT t.*,
             u.name AS requester_name, u.email AS requester_email, u.department,
             c.name AS category_name,
             tech.name AS technician_name, tech.email AS technician_email
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users tech ON t.technician_id = tech.id
      WHERE t.id = $1 AND t.deleted_at IS NULL
    `, [id]);

    if (!ticketResult.rows[0]) {
      return res.status(404).json({ error: 'Tiket tidak ditemukan.' });
    }

    const ticket = ticketResult.rows[0];

    // Hak akses: karyawan hanya tiket sendiri
    if (user.role === 'karyawan' && ticket.user_id !== user.id) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses ke tiket ini.' });
    }
    // Teknisi dapat melihat dan mengakses semua tiket

    const notes = await pool.query(`
      SELECT tn.*, u.name AS author_name, u.role AS author_role
      FROM ticket_notes tn
      LEFT JOIN users u ON tn.user_id = u.id
      WHERE tn.ticket_id = $1
      ORDER BY tn.created_at ASC
    `, [id]);

    const logs = await pool.query(`
      SELECT sl.*, u.name AS changed_by_name
      FROM status_logs sl
      LEFT JOIN users u ON sl.changed_by = u.id
      WHERE sl.ticket_id = $1
      ORDER BY sl.created_at DESC
    `, [id]);

    const technicians = (user.role === 'admin' || user.role === 'teknisi')
      ? (await pool.query("SELECT id, name FROM users WHERE role='teknisi' ORDER BY name")).rows
      : [];

    res.json({
      ticket,
      notes: notes.rows,
      logs: logs.rows,
      technicians,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat detail tiket.' });
  }
};

// PUT /api/tickets/:id
const updateTicket = async (req, res) => {
  const user = req.session.user;
  const { id } = req.params;
  const { category_id, title, description, location, priority, status, admin_note, technician_id } = req.body;
  try {
    const ticketResult = await pool.query(
      'SELECT * FROM tickets WHERE id=$1 AND deleted_at IS NULL',
      [id]
    );
    const ticket = ticketResult.rows[0];
    if (!ticket) {
      return res.status(404).json({ error: 'Tiket tidak ditemukan.' });
    }

    if (user.role === 'karyawan') {
      if (ticket.user_id !== user.id || ticket.status !== 'open') {
        return res.status(403).json({ error: 'Tiket tidak dapat diedit.' });
      }
      await pool.query(
        `UPDATE tickets SET category_id=$1, title=$2, description=$3, location=$4, priority=$5, updated_at=NOW()
         WHERE id=$6`,
        [category_id || null, title, description, location, priority, id]
      );
    } else if (user.role === 'teknisi') {
      const newStatus = status || ticket.status;
      if (newStatus !== ticket.status) {
        await pool.query(
          `INSERT INTO status_logs (ticket_id, changed_by, old_status, new_status) VALUES ($1,$2,$3,$4)`,
          [id, user.id, ticket.status, newStatus]
        );
      }
      // Automatis set technician_id jika teknisi yang merubah, atau gunakan request jika ada
      const targetTechnician = technician_id || user.id;
      await pool.query(
        `UPDATE tickets SET category_id=$1, title=$2, description=$3, location=$4, priority=$5,
                status=$6, technician_id=$7, updated_at=NOW()
         WHERE id=$8`,
        [category_id || null, title, description, location, priority, newStatus,
         targetTechnician, id]
      );
    } else if (user.role === 'admin') {
      const newStatus = status || ticket.status;
      if (newStatus !== ticket.status) {
        await pool.query(
          `INSERT INTO status_logs (ticket_id, changed_by, old_status, new_status) VALUES ($1,$2,$3,$4)`,
          [id, user.id, ticket.status, newStatus]
        );
      }
      // Jika admin melakukan update, biarkan teknisi yang sudah ada atau gunakan yang dikirimkan (bisa null)
      let targetTechnician = technician_id !== undefined ? technician_id : ticket.technician_id;
      // Jika kosongkan string (misal dari form clear), set jadi null
      if (targetTechnician === '') targetTechnician = null;

      await pool.query(
        `UPDATE tickets SET category_id=$1, title=$2, description=$3, location=$4, priority=$5,
                status=$6, admin_note=$7, technician_id=$8, updated_at=NOW()
         WHERE id=$9`,
        [category_id || null, title, description, location, priority, newStatus,
         admin_note || null, targetTechnician, id]
      );
    }

    const updatedTicketResult = await pool.query('SELECT * FROM tickets WHERE id=$1', [id]);
    res.json({ message: 'Tiket berhasil diperbarui.', ticket: updatedTicketResult.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui tiket.' });
  }
};

// POST /api/tickets/:id/notes
const addNote = async (req, res) => {
  const user = req.session.user;
  const { id } = req.params;
  const { note } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO ticket_notes (ticket_id, user_id, note) VALUES ($1,$2,$3) RETURNING *`,
      [id, user.id, note]
    );
    res.status(201).json({ message: 'Catatan berhasil ditambahkan.', note: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambahkan catatan.' });
  }
};

// DELETE /api/tickets/:id
const softDeleteTicket = async (req, res) => {
  const user = req.session.user;
  const { id } = req.params;
  try {
    const ticketResult = await pool.query(
      'SELECT * FROM tickets WHERE id=$1 AND deleted_at IS NULL',
      [id]
    );
    const ticket = ticketResult.rows[0];
    if (!ticket) {
      return res.status(404).json({ error: 'Tiket tidak ditemukan.' });
    }

    if (user.role === 'karyawan') {
      if (ticket.user_id !== user.id || ticket.status !== 'open') {
        return res.status(403).json({ error: 'Tiket tidak dapat dihapus.' });
      }
    }

    await pool.query('UPDATE tickets SET deleted_at=NOW() WHERE id=$1', [id]);
    res.json({ message: 'Tiket berhasil dipindahkan ke trash.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus tiket.' });
  }
};

// GET /api/tickets/trash/all
const getTrash = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.id, t.title, t.status, t.priority, t.deleted_at,
             u.name AS requester, c.name AS category
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.deleted_at IS NOT NULL
      ORDER BY t.deleted_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat trash.' });
  }
};

// POST /api/tickets/:id/restore
const restoreTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('UPDATE tickets SET deleted_at=NULL WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tiket tidak ditemukan.' });
    }
    res.json({ message: 'Tiket berhasil dipulihkan.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memulihkan tiket.' });
  }
};

// DELETE /api/tickets/:id/hard
const hardDeleteTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tickets WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tiket tidak ditemukan di trash.' });
    }
    res.json({ message: 'Tiket berhasil dihapus permanen.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus tiket permanen.' });
  }
};

// GET /api/tickets/api/logs
const getLogsApi = async (req, res) => {
  const user = req.session.user;
  try {
    const logs = await pool.query(`
      SELECT sl.*, t.title AS ticket_title, u.name AS changed_by_name
      FROM status_logs sl
      JOIN tickets t ON sl.ticket_id = t.id
      LEFT JOIN users u ON sl.changed_by = u.id
      WHERE t.user_id = $1
      ORDER BY sl.created_at DESC
      LIMIT 5
    `, [user.id]);
    res.json(logs.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat log tiket' });
  }
};

module.exports = {
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
};
