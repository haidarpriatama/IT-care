import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import api from '../services/api';
import { Ticket, Clock, CheckCircle, AlertCircle, Users, FolderOpen } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ stats: {}, recentTickets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div>Loading...</div>;

  const { stats, recentTickets } = data;

  return (
    <div>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 600 }}>Dashboard</h2>

      <div className="stats-grid">
        {user?.role === 'admin' && (
          <>
            <StatCard title="Total Tiket" value={stats.total} icon={Ticket} color="var(--primary-color)" />
            <StatCard title="Tiket Terbuka" value={stats.open} icon={AlertCircle} color="var(--warning-color)" />
            <StatCard title="Sedang Diproses" value={stats.inProgress} icon={Clock} color="#92400e" />
            <StatCard title="Selesai" value={stats.resolved} icon={CheckCircle} color="var(--success-color)" />
            <StatCard title="Total User" value={stats.totalUsers} icon={Users} color="var(--text-main)" />
            <StatCard title="Total Kategori" value={stats.totalCategories} icon={FolderOpen} color="var(--text-main)" />
          </>
        )}
        
        {user?.role === 'teknisi' && (
          <>
            <StatCard title="Ditugaskan" value={stats.assigned} icon={Ticket} color="var(--primary-color)" />
            <StatCard title="Sedang Diproses" value={stats.inProgress} icon={Clock} color="#92400e" />
            <StatCard title="Selesai" value={stats.resolved} icon={CheckCircle} color="var(--success-color)" />
          </>
        )}

        {user?.role === 'karyawan' && (
          <>
            <StatCard title="Total Tiket Saya" value={stats.total} icon={Ticket} color="var(--primary-color)" />
            <StatCard title="Tiket Terbuka" value={stats.open} icon={AlertCircle} color="var(--warning-color)" />
            <StatCard title="Selesai" value={stats.resolved} icon={CheckCircle} color="var(--success-color)" />
          </>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Tiket Terbaru</h3>
          <Link to="/tickets" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '13px' }}>
            Lihat Semua
          </Link>
        </div>
        <div className="table-container">
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
              {recentTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>Belum ada tiket</td>
                </tr>
              ) : (
                recentTickets.map(ticket => (
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
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ color, backgroundColor: `${color}15` }}>
      <Icon size={24} />
    </div>
    <div className="stat-info">
      <h3>{title}</h3>
      <p>{value || 0}</p>
    </div>
  </div>
);

export default Dashboard;
