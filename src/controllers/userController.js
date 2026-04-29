const bcrypt = require('bcrypt');
const pool = require('../config/db');

// ─────────────────────────────────────────────
// GET /users
// ─────────────────────────────────────────────
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
    res.render('users/index', {
      title: 'Manajemen User - IT Care',
      users: result.rows,
      search,
      roleFilter: role,
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat data user.');
    res.redirect('/dashboard');
  }
};

// ─────────────────────────────────────────────
// GET /users/create
// ─────────────────────────────────────────────
const getCreateUser = (req, res) => {
  res.render('users/create', { title: 'Tambah User - IT Care' });
};

// ─────────────────────────────────────────────
// POST /users
// ─────────────────────────────────────────────
const postCreateUser = async (req, res) => {
  const { name, email, password, role, department, phone } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length > 0) {
      req.flash('error', 'Email sudah terdaftar.');
      return res.redirect('/users/create');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, department, phone)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, email, passwordHash, role, department || null, phone || null]
    );
    req.flash('success', 'User berhasil ditambahkan.');
    res.redirect('/users');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menambahkan user.');
    res.redirect('/users/create');
  }
};

// ─────────────────────────────────────────────
// GET /users/:id/edit
// ─────────────────────────────────────────────
const getEditUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, department, phone FROM users WHERE id=$1',
      [id]
    );
    if (!result.rows[0]) {
      req.flash('error', 'User tidak ditemukan.');
      return res.redirect('/users');
    }
    res.render('users/edit', {
      title: 'Edit User - IT Care',
      editUser: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat form edit.');
    res.redirect('/users');
  }
};

// ─────────────────────────────────────────────
// PUT /users/:id
// ─────────────────────────────────────────────
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, department, phone } = req.body;
  try {
    if (password && password.trim() !== '') {
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE users SET name=$1, email=$2, password_hash=$3, role=$4, department=$5, phone=$6, updated_at=NOW()
         WHERE id=$7`,
        [name, email, passwordHash, role, department || null, phone || null, id]
      );
    } else {
      await pool.query(
        `UPDATE users SET name=$1, email=$2, role=$3, department=$4, phone=$5, updated_at=NOW()
         WHERE id=$6`,
        [name, email, role, department || null, phone || null, id]
      );
    }
    req.flash('success', 'User berhasil diperbarui.');
    res.redirect('/users');
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      req.flash('error', 'Email sudah digunakan.');
    } else {
      req.flash('error', 'Gagal memperbarui user.');
    }
    res.redirect(`/users/${id}/edit`);
  }
};

// ─────────────────────────────────────────────
// DELETE /users/:id
// ─────────────────────────────────────────────
const deleteUser = async (req, res) => {
  const { id } = req.params;
  const currentUser = req.session.user;

  if (parseInt(id) === currentUser.id) {
    req.flash('error', 'Tidak dapat menghapus akun sendiri.');
    return res.redirect('/users');
  }

  try {
    await pool.query('DELETE FROM users WHERE id=$1', [id]);
    req.flash('success', 'User berhasil dihapus.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menghapus user.');
  }
  res.redirect('/users');
};

module.exports = {
  getUsers,
  getCreateUser,
  postCreateUser,
  getEditUser,
  updateUser,
  deleteUser,
};
