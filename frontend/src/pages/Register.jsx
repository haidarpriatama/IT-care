import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registrasi gagal.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-logo">IT Care</div>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ color: 'var(--danger-color)', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
          
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input 
              type="text" 
              name="name"
              className="form-control" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              name="email"
              className="form-control" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              name="password"
              className="form-control" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Departemen</label>
            <input 
              type="text" 
              name="department"
              className="form-control" 
              value={formData.department} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Telepon</label>
            <input 
              type="text" 
              name="phone"
              className="form-control" 
              value={formData.phone} 
              onChange={handleChange} 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>Daftar</button>
        </form>
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
          Sudah punya akun? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
