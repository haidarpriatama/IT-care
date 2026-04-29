const pool = require('../config/db');

// ─────────────────────────────────────────────
// GET /reports
// JOIN lebih dari 2 tabel: tickets + users + categories + users(teknisi) + status_logs
// ─────────────────────────────────────────────
const getReports = async (req, res) => {
  const {
    search = '',
    status = '',
    priority = '',
    category_id = '',
    date_from = '',
    date_to = '',
  } = req.query;

  try {
    let query = `
      SELECT
        t.id,
        t.title,
        t.status,
        t.priority,
        t.location,
        t.created_at,
        t.updated_at,
        u.name       AS requester_name,
        u.department AS requester_dept,
        c.name       AS category_name,
        tech.name    AS technician_name,
        (SELECT COUNT(*) FROM ticket_notes tn WHERE tn.ticket_id = t.id) AS note_count,
        (SELECT sl.new_status
         FROM status_logs sl
         WHERE sl.ticket_id = t.id
         ORDER BY sl.created_at DESC LIMIT 1) AS last_status
      FROM tickets t
      INNER JOIN users u       ON t.user_id = u.id
      LEFT  JOIN categories c  ON t.category_id = c.id
      LEFT  JOIN users tech    ON t.technician_id = tech.id
      WHERE t.deleted_at IS NULL
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (t.title ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex} OR u.department ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (status) {
      query += ` AND t.status = $${paramIndex++}`;
      params.push(status);
    }
    if (priority) {
      query += ` AND t.priority = $${paramIndex++}`;
      params.push(priority);
    }
    if (category_id) {
      query += ` AND t.category_id = $${paramIndex++}`;
      params.push(category_id);
    }
    if (date_from) {
      query += ` AND t.created_at >= $${paramIndex++}`;
      params.push(date_from);
    }
    if (date_to) {
      query += ` AND t.created_at <= $${paramIndex++} + INTERVAL '1 day'`;
      params.push(date_to);
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);

    // Statistik ringkasan
    const summaryResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE t.deleted_at IS NULL) AS total,
        COUNT(*) FILTER (WHERE t.status='open' AND t.deleted_at IS NULL) AS open,
        COUNT(*) FILTER (WHERE t.status='in_progress' AND t.deleted_at IS NULL) AS in_progress,
        COUNT(*) FILTER (WHERE t.status='resolved' AND t.deleted_at IS NULL) AS resolved,
        COUNT(*) FILTER (WHERE t.status='rejected' AND t.deleted_at IS NULL) AS rejected
      FROM tickets t
    `);

    // Statistik per kategori
    const categoryStats = await pool.query(`
      SELECT c.name, COUNT(t.id) AS total
      FROM categories c
      LEFT JOIN tickets t ON t.category_id = c.id AND t.deleted_at IS NULL
      GROUP BY c.name
      ORDER BY total DESC
    `);

    const categories = await pool.query('SELECT * FROM categories ORDER BY name');

    res.render('reports/index', {
      title: 'Laporan - IT Care',
      tickets: result.rows,
      summary: summaryResult.rows[0],
      categoryStats: categoryStats.rows,
      categories: categories.rows,
      filters: { search, status, priority, category_id, date_from, date_to },
    });
  } catch (err) {
    console.error('Reports error:', err);
    req.flash('error', 'Gagal memuat laporan.');
    res.redirect('/dashboard');
  }
};

module.exports = { getReports };
