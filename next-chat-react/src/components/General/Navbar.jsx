import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'g-active' : '';

  return (
    <nav className="g-navbar d-flex align-items-center justify-content-between px-4">
      <a className="d-flex align-items-center gap-2 text-decoration-none" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <span className="logo-icon">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke="#fff" strokeWidth="2"/></svg>
        </span>
        <span style={{ fontSize: '17px', fontWeight: 700, color: '#111827' }}>NexChat</span>
      </a>
      <div className="d-none d-md-flex align-items-center gap-1">
        <span className={`g-nav-link ${isActive('/')}`} onClick={() => navigate('/')}>Home</span>
        <span className={`g-nav-link ${isActive('/about')}`} onClick={() => navigate('/about')}>About</span>
        <span className={`g-nav-link ${isActive('/help')}`} onClick={() => navigate('/help')}>Help</span>
        <span className={`g-nav-link ${isActive('/contact')}`} onClick={() => navigate('/contact')}>Contact</span>
      </div>
      <div className="d-flex align-items-center gap-2">
        <span className={`g-nav-link ${isActive('/login')}`} onClick={() => navigate('/login')}>Login</span>
        <button className="btn btn-primary btn-sm px-3 fw-600" style={{ borderRadius: '8px' }} onClick={() => navigate('/register')}>Register</button>
      </div>
    </nav>
  );
};

export default Navbar;
