import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import CreateTicket from './pages/CreateTicket';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import Trash from './pages/Trash';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        
        {/* Tickets */}
        <Route path="tickets" element={<Tickets />} />
        <Route path="tickets/create" element={<ProtectedRoute allowedRoles={['admin', 'karyawan']}><CreateTicket /></ProtectedRoute>} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        
        {/* Admin only routes */}
        <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>} />
        <Route path="categories" element={<ProtectedRoute allowedRoles={['admin', 'teknisi']}><Categories /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute allowedRoles={['admin', 'teknisi']}><Reports /></ProtectedRoute>} />
        <Route path="trash" element={<ProtectedRoute allowedRoles={['admin']}><Trash /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
