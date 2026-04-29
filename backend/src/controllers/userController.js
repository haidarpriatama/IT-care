const bcrypt = require('bcrypt');
const pool = require('../config/db');

// GET /api/users
const getUsers = async (req, res) => {
  const { search = '', role = '' } = req.query;
  try {
    let query = 'SELECT id, name, email, role, department, phone, created_at FROM users WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR department ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (role) {
      query += ` AND role = $${paramIndex++}`;
      params.push(role);
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat data user.' });
  }
};

// POST /api/users
const postCreateUser = async (req, res) => {
  const { name, email, password, role, department, phone } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, department, phone)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, department, phone, created_at`,
      [name, email, passwordHash, role, department || null, phone || null]
    );
    res.status(201).json({ message: 'User berhasil ditambahkan.', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambahkan user.' });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, department, phone } = req.body;
  try {
    let result;
    if (password && password.trim() !== '') {
      const passwordHash = await bcrypt.hash(password, 10);
      result = await pool.query(
        `UPDATE users SET name=$1, email=$2, password_hash=$3, role=$4, department=$5, phone=$6, updated_at=NOW()
         WHERE id=$7 RETURNING id, name, email, role, department, phone, updated_at`,
        [name, email, passwordHash, role, department || null, phone || null, id]
      );
    } else {
      result = await pool.query(
        `UPDATE users SET name=$1, email=$2, role=$3, department=$4, phone=$5, updated_at=NOW()
         WHERE id=$6 RETURNING id, name, email, role, department, phone, updated_at`,
        [name, email, role, department || null, phone || null, id]
      );
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }
    res.json({ message: 'User berhasil diperbarui.', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(400).json({ error: 'Email telah digunakan.' });
    } else {
      res.status(500).json({ error: 'Gagal memperbarui user.' });
    }
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  const { id } = req.params;
  const currentUser = req.session.user;

  if (parseInt(id) === currentUser.id) {
    return res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri.' });
  }

  try {
    const result = await pool.query('DELETE FROM users WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }
    res.json({ message: 'User berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus user.' });
  }
};

module.exports = {
  getUsers,
  postCreateUser,
  updateUser,
  deleteUser,
};
