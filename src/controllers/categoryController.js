const pool = require('../config/db');

// ─────────────────────────────────────────────
// GET /categories
// ─────────────────────────────────────────────
const getCategories = async (req, res) => {
  const { search = '' } = req.query;
  try {
    let query = 'SELECT * FROM categories';
    const params = [];
    if (search) {
      query += ' WHERE name ILIKE $1 OR description ILIKE $1';
      params.push(`%${search}%`);
    }
    query += ' ORDER BY name';
    const result = await pool.query(query, params);
    res.render('categories/index', {
      title: 'Kategori - IT Care',
      categories: result.rows,
      search,
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat kategori.');
    res.redirect('/dashboard');
  }
};

// ─────────────────────────────────────────────
// GET /categories/create
// ─────────────────────────────────────────────
const getCreateCategory = (req, res) => {
  res.render('categories/create', { title: 'Tambah Kategori - IT Care' });
};

// ─────────────────────────────────────────────
// POST /categories
// ─────────────────────────────────────────────
const postCreateCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2)',
      [name, description || null]
    );
    req.flash('success', 'Kategori berhasil ditambahkan.');
    res.redirect('/categories');
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      req.flash('error', 'Nama kategori sudah ada.');
    } else {
      req.flash('error', 'Gagal menambahkan kategori.');
    }
    res.redirect('/categories/create');
  }
};

// ─────────────────────────────────────────────
// GET /categories/:id/edit
// ─────────────────────────────────────────────
const getEditCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM categories WHERE id=$1', [id]);
    if (!result.rows[0]) {
      req.flash('error', 'Kategori tidak ditemukan.');
      return res.redirect('/categories');
    }
    res.render('categories/edit', {
      title: 'Edit Kategori - IT Care',
      category: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat form edit.');
    res.redirect('/categories');
  }
};

// ─────────────────────────────────────────────
// PUT /categories/:id
// ─────────────────────────────────────────────
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    await pool.query(
      'UPDATE categories SET name=$1, description=$2, updated_at=NOW() WHERE id=$3',
      [name, description || null, id]
    );
    req.flash('success', 'Kategori berhasil diperbarui.');
    res.redirect('/categories');
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      req.flash('error', 'Nama kategori sudah ada.');
    } else {
      req.flash('error', 'Gagal memperbarui kategori.');
    }
    res.redirect(`/categories/${id}/edit`);
  }
};

// ─────────────────────────────────────────────
// DELETE /categories/:id
// ─────────────────────────────────────────────
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM categories WHERE id=$1', [id]);
    req.flash('success', 'Kategori berhasil dihapus.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menghapus kategori. Mungkin masih digunakan oleh tiket.');
  }
  res.redirect('/categories');
};

module.exports = {
  getCategories,
  getCreateCategory,
  postCreateCategory,
  getEditCategory,
  updateCategory,
  deleteCategory,
};
