const bcrypt = require('bcrypt');
const pool = require('../config/db');

// ─────────────────────────────────────────────
// GET /login
// ─────────────────────────────────────────────
const getLogin = (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('auth/login', { title: 'Login - IT Care' });
};

// ─────────────────────────────────────────────
// POST /login
// ─────────────────────────────────────────────
const postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      req.flash('error', 'Email atau password salah.');
      return res.redirect('/login');
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      req.flash('error', 'Email atau password salah.');
      return res.redirect('/login');
    }

    // Simpan user ke session (tanpa password_hash)
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
    };

    req.flash('success', `Selamat datang, ${user.name}!`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'Terjadi kesalahan. Coba lagi.');
    res.redirect('/login');
  }
};

// ─────────────────────────────────────────────
// GET /register
// ─────────────────────────────────────────────
const getRegister = (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('auth/register', { title: 'Register - IT Care' });
};

// ─────────────────────────────────────────────
// POST /register
// ─────────────────────────────────────────────
const postRegister = async (req, res) => {
  const { name, email, password, role, department, phone } = req.body;
  try {
    // Cek email duplikat
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      req.flash('error', 'Email sudah terdaftar.');
      return res.redirect('/register');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, department, phone)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, email, passwordHash, role || 'karyawan', department, phone]
    );

    req.flash('success', 'Registrasi berhasil! Silakan login.');
    res.redirect('/login');
  } catch (err) {
    console.error('Register error:', err);
    req.flash('error', 'Terjadi kesalahan. Coba lagi.');
    res.redirect('/register');
  }
};

// ─────────────────────────────────────────────
// GET /logout
// ─────────────────────────────────────────────
const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

module.exports = { getLogin, postLogin, getRegister, postRegister, logout };
