import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../utils/AuthContext';
import { Trash2, Edit } from 'lucide-react';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  
  // Status update states
  const [status, setStatus] = useState('');
  const [technicianId, setTechnicianId] = useState('');

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setData(res.data);
      setStatus(res.data.ticket.status);
      setTechnicianId(res.data.ticket.technician_id || '');
    } catch (err) {
      console.error(err);
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleUpdateStatus = async () => {
    try {
      await api.put(`/tickets/${id}`, { status, technician_id: technicianId });
      fetchTicket();
    } catch (err) {
      console.error(err);
      alert('Gagal update tiket');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await api.post(`/tickets/${id}/notes`, { note: noteText });
      setNoteText('');
      fetchTicket();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin memindahkan tiket ini ke trash?')) return;
    try {
      await api.delete(`/tickets/${id}`);
      navigate('/tickets');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus tiket');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Ticket not found</div>;

  const { ticket, notes, logs, technicians } = data;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Tiket #{ticket.id}: {ticket.title}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Admin / Karyawan can edit/delete if allowed */}
          {(user?.role === 'admin' || (user?.role === 'karyawan' && ticket.status === 'open')) && (
            <>
              {/* Note: Edit feature can be a separate page or modal, keeping it simple here */}
              <button className="btn btn-danger" onClick={handleDelete}>
                <Trash2 size={16} /> Hapus
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Detail Informasi</h3>
            </div>
            <div className="card-body">
              <p><strong>Deskripsi:</strong><br />{ticket.description}</p>
              <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid var(--border-color)' }}/>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><strong>Kategori:</strong> {ticket.category_name}</div>
                <div><strong>Prioritas:</strong> {ticket.priority}</div>
                <div><strong>Lokasi:</strong> {ticket.location || '-'}</div>
                <div><strong>Tanggal:</strong> {new Date(ticket.created_at).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Catatan</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
                {notes.map(note => (
                  <div key={note.id} style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <strong>{note.author_name} ({note.author_role})</strong>
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '14px' }}>{note.note}</div>
                  </div>
                ))}
                {notes.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Belum ada catatan.</div>}
              </div>
              
              <form onSubmit={handleAddNote}>
                <div className="form-group">
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Tambah catatan..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Kirim Catatan</button>
              </form>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Status</h3>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: '16px' }}>
                <span className={`badge badge-${ticket.status}`} style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {ticket.status.toUpperCase()}
                </span>
              </div>
              
              {(user?.role === 'admin' || user?.role === 'teknisi') && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Ubah Status</label>
                    <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  {user?.role === 'admin' && (
                    <div className="form-group">
                      <label className="form-label">Tugaskan Teknisi</label>
                      <select className="form-control" value={technicianId} onChange={e => setTechnicianId(e.target.value)}>
                        <option value="">-- Pilih Teknisi --</option>
                        {technicians.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <button className="btn btn-primary" onClick={handleUpdateStatus} style={{ width: '100%' }}>Update</button>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Log Aktivitas</h3>
            </div>
            <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                {logs.map(log => (
                  <li key={log.id} style={{ marginBottom: '8px' }}>
                    <strong>{log.changed_by_name}</strong> mengubah status menjadi <strong>{log.new_status}</strong><br />
                    <span style={{ fontSize: '11px' }}>{new Date(log.created_at).toLocaleString()}</span>
                  </li>
                ))}
                {logs.length === 0 && <li>Belum ada aktivitas</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
