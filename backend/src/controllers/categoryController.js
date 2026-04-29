const pool = require('../config/db');

// GET /api/categories
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
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat kategori.' });
  }
};

// POST /api/categories
const postCreateCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    res.status(201).json({ message: 'Kategori berhasil ditambahkan.', category: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(400).json({ error: 'Nama kategori sudah ada.' });
    } else {
      res.status(500).json({ error: 'Gagal menambahkan kategori.' });
    }
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE categories SET name=$1, description=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
      [name, description || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kategori tidak ditemukan.' });
    }
    res.json({ message: 'Kategori berhasil diperbarui.', category: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(400).json({ error: 'Nama kategori sudah ada.' });
    } else {
      res.status(500).json({ error: 'Gagal memperbarui kategori.' });
    }
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM categories WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kategori tidak ditemukan.' });
    }
    res.json({ message: 'Kategori berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus kategori. Mungkin masih digunakan oleh tiket.' });
  }
};

module.exports = {
  getCategories,
  postCreateCategory,
  updateCategory,
  deleteCategory,
};
