const pool = require('../config/db');

// ─────────────────────────────────────────────
// GET /tickets  (list tiket)
// ─────────────────────────────────────────────
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
    } else if (user.role === 'teknisi') {
      baseQuery += ` AND t.technician_id = $${paramIndex++}`;
      params.push(user.id);
    }

    if (search) {
      baseQuery += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex})`;
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
      `SELECT t.id, t.title, t.status, t.priority, t.created_at, t.location,
              u.name AS requester, c.name AS category, tech.name AS technician
       ${baseQuery}
       ORDER BY t.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      dataParams
    );

    res.render('tickets/index', {
      title: 'Tiket - IT Care',
      tickets: tickets.rows,
      search,
      status,
      priority,
      currentPage: parseInt(page),
      totalPages,
      total,
    });
  } catch (err) {
    console.error('Tickets error:', err);
    req.flash('error', 'Gagal memuat data tiket.');
    res.redirect('/dashboard');
  }
};

// ─────────────────────────────────────────────
// GET /tickets/create
// ─────────────────────────────────────────────
const getCreateTicket = async (req, res) => {
  try {
    const categories = await pool.query('SELECT * FROM categories ORDER BY name');
    res.render('tickets/create', {
      title: 'Buat Tiket - IT Care',
      categories: categories.rows,
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat form.');
    res.redirect('/tickets');
  }
};

// ─────────────────────────────────────────────
// POST /tickets
// ─────────────────────────────────────────────
const postCreateTicket = async (req, res) => {
  const user = req.session.user;
  const { category_id, title, description, location, priority } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tickets (user_id, category_id, title, description, location, priority)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [user.id, category_id || null, title, description, location, priority || 'medium']
    );
    // Log status awal
    await pool.query(
      `INSERT INTO status_logs (ticket_id, changed_by, old_status, new_status) VALUES ($1, $2, $3, $4)`,
      [result.rows[0].id, user.id, null, 'open']
    );
    req.flash('success', 'Tiket berhasil dibuat.');
    res.redirect('/tickets');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal membuat tiket.');
    res.redirect('/tickets/create');
  }
};

// ─────────────────────────────────────────────
// GET /tickets/:id
// ─────────────────────────────────────────────
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
      req.flash('error', 'Tiket tidak ditemukan.');
      return res.redirect('/tickets');
    }

    const ticket = ticketResult.rows[0];

    // Hak akses: karyawan hanya tiket sendiri
    if (user.role === 'karyawan' && ticket.user_id !== user.id) {
      req.flash('error', 'Anda tidak memiliki akses ke tiket ini.');
      return res.redirect('/tickets');
    }
    // Teknisi hanya tiket yang ditugaskan
    if (user.role === 'teknisi' && ticket.technician_id !== user.id) {
      req.flash('error', 'Anda tidak memiliki akses ke tiket ini.');
      return res.redirect('/tickets');
    }

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
      ORDER BY sl.created_at ASC
    `, [id]);

    const technicians = user.role === 'admin'
      ? (await pool.query("SELECT id, name FROM users WHERE role='teknisi' ORDER BY name")).rows
      : [];

    res.render('tickets/detail', {
      title: `Tiket #${id} - IT Care`,
      ticket,
      notes: notes.rows,
      logs: logs.rows,
      technicians,
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat detail tiket.');
    res.redirect('/tickets');
  }
};

// ─────────────────────────────────────────────
// GET /tickets/:id/edit
// ─────────────────────────────────────────────
const getEditTicket = async (req, res) => {
  const user = req.session.user;
  const { id } = req.params;
  try {
    const ticketResult = await pool.query(
      'SELECT * FROM tickets WHERE id=$1 AND deleted_at IS NULL',
      [id]
    );
    const ticket = ticketResult.rows[0];
    if (!ticket) {
      req.flash('error', 'Tiket tidak ditemukan.');
      return res.redirect('/tickets');
    }

    // Karyawan hanya bisa edit tiket sendiri yang masih open
    if (user.role === 'karyawan') {
      if (ticket.user_id !== user.id || ticket.status !== 'open') {
        req.flash('error', 'Tiket tidak dapat diedit.');
        return res.redirect('/tickets');
      }
    }

    const categories = await pool.query('SELECT * FROM categories ORDER BY name');
    res.render('tickets/edit', {
      title: 'Edit Tiket - IT Care',
      ticket,
      categories: categories.rows,
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat form edit.');
    res.redirect('/tickets');
  }
};

// ─────────────────────────────────────────────
// PUT /tickets/:id
// ─────────────────────────────────────────────
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
      req.flash('error', 'Tiket tidak ditemukan.');
      return res.redirect('/tickets');
    }

    if (user.role === 'karyawan') {
      // Hanya update field dasar, jika masih open
      if (ticket.user_id !== user.id || ticket.status !== 'open') {
        req.flash('error', 'Tiket tidak dapat diedit.');
        return res.redirect('/tickets');
      }
      await pool.query(
        `UPDATE tickets SET category_id=$1, title=$2, description=$3, location=$4, priority=$5, updated_at=NOW()
         WHERE id=$6`,
        [category_id || null, title, description, location, priority, id]
      );
    } else if (user.role === 'teknisi') {
      // Teknisi hanya bisa ubah status jika tiket ditugaskan kepadanya
      if (ticket.technician_id !== user.id) {
        req.flash('error', 'Akses ditolak.');
        return res.redirect('/tickets');
      }
      const newStatus = status || ticket.status;
      if (newStatus !== ticket.status) {
        await pool.query(
          `INSERT INTO status_logs (ticket_id, changed_by, old_status, new_status) VALUES ($1,$2,$3,$4)`,
          [id, user.id, ticket.status, newStatus]
        );
      }
      await pool.query(
        `UPDATE tickets SET status=$1, updated_at=NOW() WHERE id=$2`,
        [newStatus, id]
      );
    } else if (user.role === 'admin') {
      const newStatus = status || ticket.status;
      if (newStatus !== ticket.status) {
        await pool.query(
          `INSERT INTO status_logs (ticket_id, changed_by, old_status, new_status) VALUES ($1,$2,$3,$4)`,
          [id, user.id, ticket.status, newStatus]
        );
      }
      await pool.query(
        `UPDATE tickets SET category_id=$1, title=$2, description=$3, location=$4, priority=$5,
                status=$6, admin_note=$7, technician_id=$8, updated_at=NOW()
         WHERE id=$9`,
        [category_id || null, title, description, location, priority, newStatus,
         admin_note || null, technician_id || null, id]
      );
    }

    req.flash('success', 'Tiket berhasil diperbarui.');
    res.redirect(`/tickets/${id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memperbarui tiket.');
    res.redirect(`/tickets/${id}`);
  }
};

// ─────────────────────────────────────────────
// POST /tickets/:id/notes  (tambah catatan)
// ─────────────────────────────────────────────
const addNote = async (req, res) => {
  const user = req.session.user;
  const { id } = req.params;
  const { note } = req.body;
  try {
    await pool.query(
      `INSERT INTO ticket_notes (ticket_id, user_id, note) VALUES ($1,$2,$3)`,
      [id, user.id, note]
    );
    req.flash('success', 'Catatan berhasil ditambahkan.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menambahkan catatan.');
  }
  res.redirect(`/tickets/${id}`);
};

// ─────────────────────────────────────────────
// DELETE /tickets/:id  (soft delete)
// ─────────────────────────────────────────────
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
      req.flash('error', 'Tiket tidak ditemukan.');
      return res.redirect('/tickets');
    }

    // Karyawan hanya bisa soft delete miliknya yang belum diproses
    if (user.role === 'karyawan') {
      if (ticket.user_id !== user.id || ticket.status !== 'open') {
        req.flash('error', 'Tiket tidak dapat dihapus.');
        return res.redirect('/tickets');
      }
    }

    await pool.query('UPDATE tickets SET deleted_at=NOW() WHERE id=$1', [id]);
    req.flash('success', 'Tiket berhasil dipindahkan ke trash.');
    res.redirect('/tickets');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menghapus tiket.');
    res.redirect('/tickets');
  }
};

// ─────────────────────────────────────────────
// GET /trash  (halaman trash - admin only)
// ─────────────────────────────────────────────
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
    res.render('tickets/trash', {
      title: 'Trash - IT Care',
      tickets: result.rows,
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat trash.');
    res.redirect('/dashboard');
  }
};

// ─────────────────────────────────────────────
// POST /tickets/:id/restore  (restore)
// ─────────────────────────────────────────────
const restoreTicket = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE tickets SET deleted_at=NULL WHERE id=$1', [id]);
    req.flash('success', 'Tiket berhasil dipulihkan.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memulihkan tiket.');
  }
  res.redirect('/trash');
};

// ─────────────────────────────────────────────
// DELETE /tickets/:id/hard  (hard delete - admin only)
// ─────────────────────────────────────────────
const hardDeleteTicket = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tickets WHERE id=$1', [id]);
    req.flash('success', 'Tiket berhasil dihapus permanen.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menghapus tiket.');
  }
  res.redirect('/trash');
};

// ─────────────────────────────────────────────
// GET /api/logs  (api for notifications)
// ─────────────────────────────────────────────
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
};
