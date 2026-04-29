import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { RotateCcw, Trash2 } from 'lucide-react';

const Trash = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrash();
  }, []);

  const fetchTrash = async () => {
    try {
      const res = await api.get('/tickets/trash/all');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.post(`/tickets/${id}/restore`);
      fetchTrash();
    } catch (err) {
      alert('Gagal memulihkan tiket');
    }
  };

  const handleHardDelete = async (id) => {
    if (!window.confirm('Hapus permanen tiket ini? Tidak dapat dikembalikan.')) return;
    try {
      await api.delete(`/tickets/${id}/hard`);
      fetchTrash();
    } catch (err) {
      alert('Gagal menghapus permanen');
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 600 }}>Trash Tiket</h2>
      
      <div className="card">
        <div className="table-container">
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Status</th>
                  <th>Kategori</th>
                  <th>Pemohon</th>
                  <th>Dihapus Pada</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500 }}>{t.title}</td>
                    <td>{t.status}</td>
                    <td>{t.category}</td>
                    <td>{t.requester}</td>
                    <td>{new Date(t.deleted_at).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px', marginRight: '8px' }} onClick={() => handleRestore(t.id)}>
                        <RotateCcw size={14} style={{ marginRight: '4px' }} /> Restore
                      </button>
                      <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleHardDelete(t.id)}>
                        <Trash2 size={14} style={{ marginRight: '4px' }} /> Hard Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>Trash kosong</td>
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

export default Trash;
