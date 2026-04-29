import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateTicket = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    priority: 'medium',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tickets', formData);
      navigate('/tickets');
    } catch (err) {
      console.error(err);
      alert('Gagal membuat tiket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 600 }}>Buat Tiket Baru</h2>
      
      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Judul Tiket <span style={{ color: 'var(--danger-color)' }}>*</span></label>
              <input 
                type="text" 
                name="title"
                className="form-control" 
                value={formData.title} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Kategori <span style={{ color: 'var(--danger-color)' }}>*</span></label>
              <select 
                name="category_id"
                className="form-control" 
                value={formData.category_id} 
                onChange={handleChange}
                required
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Prioritas <span style={{ color: 'var(--danger-color)' }}>*</span></label>
              <select 
                name="priority"
                className="form-control" 
                value={formData.priority} 
                onChange={handleChange}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Lokasi / Ruangan</label>
              <input 
                type="text" 
                name="location"
                className="form-control" 
                value={formData.location} 
                onChange={handleChange} 
                placeholder="Misal: Ruang Meeting Lantai 2"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Deskripsi Kendala <span style={{ color: 'var(--danger-color)' }}>*</span></label>
              <textarea 
                name="description"
                className="form-control" 
                rows="5"
                value={formData.description} 
                onChange={handleChange} 
                required 
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Kirim Tiket'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/tickets')}>
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;
