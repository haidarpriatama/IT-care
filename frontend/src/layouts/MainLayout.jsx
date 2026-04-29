import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  Users,
  FolderOpen,
  FileBarChart,
  Trash2,
  LogOut,
  Bell,
  Menu,
} from 'lucide-react';
import api from '../services/api';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/tickets/api/logs');
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) {
      fetchLogs();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const NavItem = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      className={`nav-item ${location.pathname.startsWith(to) && to !== '/' ? 'active' : location.pathname === to ? 'active' : ''}`}
    >
      <Icon size={18} />
      {children}
    </Link>
  );

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          IT Care
        </div>
        <nav className="sidebar-nav">
          <NavItem to="/" icon={LayoutDashboard}>Dashboard</NavItem>
          <NavItem to="/tickets" icon={Ticket}>Tiket</NavItem>
          
          {user?.role === 'admin' && (
            <>
              <div className="nav-section-title">Admin Area</div>
              <NavItem to="/reports" icon={FileBarChart}>Laporan</NavItem>
              <NavItem to="/users" icon={Users}>Users</NavItem>
              <NavItem to="/categories" icon={FolderOpen}>Kategori</NavItem>
              <NavItem to="/trash" icon={Trash2}>Trash</NavItem>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-title"></div>
          <div className="topbar-actions">
            <div style={{ position: 'relative' }}>
              <button 
                className="btn btn-outline" 
                style={{ padding: '6px', border: 'none' }}
                onClick={() => setShowLogs(!showLogs)}
              >
                <Bell size={20} />
              </button>
              {showLogs && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  width: '300px',
                  backgroundColor: 'white',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 50
                }}>
                  <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>
                    Notifikasi
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {logs.length === 0 ? (
                      <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada aktivitas.</div>
                    ) : (
                      logs.map(log => (
                        <div key={log.id} style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                          <div><strong>Tiket:</strong> {log.ticket_title}</div>
                          <div><strong>Status:</strong> <span className={`badge badge-${log.new_status}`}>{log.new_status}</span></div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="user-profile">
              <span>{user?.name}</span>
              <span className="badge badge-open" style={{ marginLeft: '8px' }}>{user?.role}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '6px 12px' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>
        
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
