import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Reports = () => {
  const [data, setData] = useState({ tickets: [], summary: {}, categoryStats: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '', status: '', priority: '', category_id: '', date_from: '', date_to: ''
  });

  const fetchReports = async () => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await api.get(`/reports?${queryParams}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []); // Initial load

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handleReset = () => {
    setFilters({ search: '', status: '', priority: '', category_id: '', date_from: '', date_to: '' });
  };

  const { tickets, summary, categoryStats, categories } = data;

  return (
    <div>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 600 }}>Laporan Tiket</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card"><div className="card-body"><h3>Total</h3><p style={{ fontSize: '24px', fontWeight: 'bold' }}>{summary.total || 0}</p></div></div>
        <div className="card"><div className="card-body"><h3>Open</h3><p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--warning-color)' }}>{summary.open || 0}</p></div></div>
        <div className="card"><div className="card-body"><h3>In Progress</h3><p style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>{summary.in_progress || 0}</p></div></div>
        <div className="card"><div className="card-body"><h3>Resolved</h3><p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success-color)' }}>{summary.resolved || 0}</p></div></div>
        <div className="card"><div className="card-body"><h3>Rejected</h3><p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--danger-color)' }}>{summary.rejected || 0}</p></div></div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body">
          <form onSubmit={handleFilter} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '150px' }}>
              <label className="form-label">Cari</label>
              <input type="text" className="form-control" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, width: '120px' }}>
              <label className="form-label">Status</label>
              <select className="form-control" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                <option value="">Semua</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, width: '150px' }}>
              <label className="form-label">Kategori</label>
              <select className="form-control" value={filters.category_id} onChange={e => setFilters({...filters, category_id: e.target.value})}>
                <option value="">Semua</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, width: '140px' }}>
              <label className="form-label">Dari Tanggal</label>
              <input type="date" className="form-control" value={filters.date_from} onChange={e => setFilters({...filters, date_from: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, width: '140px' }}>
              <label className="form-label">Sampai Tanggal</label>
              <input type="date" className="form-control" value={filters.date_to} onChange={e => setFilters({...filters, date_to: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary">Filter</button>
            <button type="button" className="btn btn-outline" onClick={handleReset}>Reset</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tiket</th>
                  <th>Status</th>
                  <th>Kategori</th>
                  <th>Pemohon</th>
                  <th>Teknisi</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id}>
                    <td><strong>#{t.id}</strong> {t.title}</td>
                    <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                    <td>{t.category_name}</td>
                    <td>{t.requester_name} ({t.requester_dept})</td>
                    <td>{t.technician_name || '-'}</td>
                    <td>{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>Data tidak ditemukan</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
