import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🎓 PlacementHub</Link>
      <div className="navbar-links">
        {!user && (
          <>
            <Link to="/login"><button className="btn btn-secondary btn-sm">Login</button></Link>
            <Link to="/register"><button className="btn btn-primary btn-sm">Register</button></Link>
          </>
        )}
        {user && (
          <>
            <span className="text-muted hide-mobile" style={{ fontSize: '0.85rem' }}>
              👋 {user.name}
            </span>
            <Link to={user.role === 'admin' ? '/admin-dashboard' : '/student-dashboard'}>
              <button className="btn btn-secondary btn-sm">Dashboard</button>
            </Link>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
