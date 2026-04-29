import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { user } = useAuth();

  const fetchTickets = async () => {
    try {
      const res = await api.get(`/tickets?search=${search}&status=${status}`);
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [search, status]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Daftar Tiket</h2>
        {user?.role !== 'teknisi' && (
          <Link to="/tickets/create" className="btn btn-primary">
            <Plus size={18} /> Buat Tiket
          </Link>
        )}
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Cari tiket..." 
              className="form-control" 
              style={{ paddingLeft: '36px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="form-control" 
            style={{ width: '150px' }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="table-container">
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Status</th>
                  <th>Prioritas</th>
                  <th>Kategori</th>
                  {user?.role !== 'karyawan' && <th>Pemohon</th>}
                  {user?.role !== 'teknisi' && <th>Teknisi</th>}
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>Tidak ada tiket ditemukan</td>
                  </tr>
                ) : (
                  tickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td style={{ fontWeight: 500 }}>{ticket.title}</td>
                      <td><span className={`badge badge-${ticket.status}`}>{ticket.status}</span></td>
                      <td>{ticket.priority}</td>
                      <td>{ticket.category}</td>
                      {user?.role !== 'karyawan' && <td>{ticket.requester}</td>}
                      {user?.role !== 'teknisi' && <td>{ticket.technician || '-'}</td>}
                      <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/tickets/${ticket.id}`} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}>
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tickets;
