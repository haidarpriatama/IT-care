const bcrypt = require('bcrypt');
const pool = require('../config/db');

// POST /api/auth/login
const postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Email atau password salah.' });
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

    res.json({ message: `Selamat datang, ${user.name}!`, user: req.session.user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan. Coba lagi.' });
  }
};

// POST /api/auth/register
const postRegister = async (req, res) => {
  const { name, email, password, role, department, phone } = req.body;
  try {
    // Cek email duplikat
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, department, phone)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role`,
      [name, email, passwordHash, role || 'karyawan', department, phone]
    );

    res.status(201).json({ message: 'Registrasi berhasil!', user: result.rows[0] });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan. Coba lagi.' });
  }
};

// POST /api/auth/logout
const postLogout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Berhasil logout' });
  });
};

// GET /api/auth/me
const getMe = (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Belum login' });
  }
};

module.exports = { postLogin, postRegister, postLogout, getMe };
