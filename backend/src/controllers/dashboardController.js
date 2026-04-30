const pool = require('../config/db');

// ─────────────────────────────────────────────
// GET /dashboard
// ─────────────────────────────────────────────
const getDashboard = async (req, res) => {
  const user = req.session.user;
  try {
    let stats = {};
    let recentTickets = [];

    if (user.role === 'admin') {
      // Statistik admin
      const [total, open, inProgress, resolved, rejected, totalUsers, totalCategories] =
        await Promise.all([
          pool.query("SELECT COUNT(*) FROM tickets WHERE deleted_at IS NULL"),
          pool.query("SELECT COUNT(*) FROM tickets WHERE status='open' AND deleted_at IS NULL"),
          pool.query("SELECT COUNT(*) FROM tickets WHERE status='in_progress' AND deleted_at IS NULL"),
          pool.query("SELECT COUNT(*) FROM tickets WHERE status='resolved' AND deleted_at IS NULL"),
          pool.query("SELECT COUNT(*) FROM tickets WHERE status='rejected' AND deleted_at IS NULL"),
          pool.query("SELECT COUNT(*) FROM users"),
          pool.query("SELECT COUNT(*) FROM categories"),
        ]);

      stats = {
        total: parseInt(total.rows[0].count),
        open: parseInt(open.rows[0].count),
        inProgress: parseInt(inProgress.rows[0].count),
        resolved: parseInt(resolved.rows[0].count),
        rejected: parseInt(rejected.rows[0].count),
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalCategories: parseInt(totalCategories.rows[0].count),
      };

      // Recent tickets
      const result = await pool.query(`
        SELECT t.id, t.ticket_number, t.title, t.status, t.priority, t.created_at,
               u.name AS requester, c.name AS category,
               tech.name AS technician
        FROM tickets t
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN users tech ON t.technician_id = tech.id
        WHERE t.deleted_at IS NULL
        ORDER BY t.created_at DESC LIMIT 8
      `);
      recentTickets = result.rows;

    } else if (user.role === 'teknisi') {
      // Statistik teknisi
      const [assigned, inProgress, resolved] = await Promise.all([
        pool.query("SELECT COUNT(*) FROM tickets WHERE technician_id=$1 AND deleted_at IS NULL", [user.id]),
        pool.query("SELECT COUNT(*) FROM tickets WHERE technician_id=$1 AND status='in_progress' AND deleted_at IS NULL", [user.id]),
        pool.query("SELECT COUNT(*) FROM tickets WHERE technician_id=$1 AND status='resolved' AND deleted_at IS NULL", [user.id]),
      ]);

      stats = {
        assigned: parseInt(assigned.rows[0].count),
        inProgress: parseInt(inProgress.rows[0].count),
        resolved: parseInt(resolved.rows[0].count),
      };

      const result = await pool.query(`
        SELECT t.id, t.ticket_number, t.title, t.status, t.priority, t.created_at,
               u.name AS requester, c.name AS category
        FROM tickets t
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.deleted_at IS NULL
        ORDER BY t.created_at DESC LIMIT 8
      `);
      recentTickets = result.rows;

    } else {
      // Statistik karyawan
      const [total, open, resolved] = await Promise.all([
        pool.query("SELECT COUNT(*) FROM tickets WHERE user_id=$1 AND deleted_at IS NULL", [user.id]),
        pool.query("SELECT COUNT(*) FROM tickets WHERE user_id=$1 AND status='open' AND deleted_at IS NULL", [user.id]),
        pool.query("SELECT COUNT(*) FROM tickets WHERE user_id=$1 AND status='resolved' AND deleted_at IS NULL", [user.id]),
      ]);

      stats = {
        total: parseInt(total.rows[0].count),
        open: parseInt(open.rows[0].count),
        resolved: parseInt(resolved.rows[0].count),
      };

      const result = await pool.query(`
        SELECT t.id, t.ticket_number, t.title, t.status, t.priority, t.created_at,
               c.name AS category, tech.name AS technician
        FROM tickets t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN users tech ON t.technician_id = tech.id
        WHERE t.user_id = $1 AND t.deleted_at IS NULL
        ORDER BY t.created_at DESC LIMIT 8
      `, [user.id]);
      recentTickets = result.rows;
    }

    res.json({ stats, recentTickets });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Gagal untuk memuat dashboard.' });
  }
};

module.exports = { getDashboard };
