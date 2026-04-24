import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DevTopbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isGeneralActive = () => ['/', '/about', '/help', '/contact', '/login', '/register'].includes(location.pathname);
  const isAdminActive = () => location.pathname.startsWith('/admin');
  const isUserActive = () => location.pathname.startsWith('/user');

  return (
    <nav className="dev-topbar">
      <div className="container-fluid d-flex align-items-center gap-3">
        <a className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="logo-icon me-2" style={{ width: '24px', height: '24px', borderRadius: '6px' }}>
            <svg viewBox="0 0 24 24" width="13" height="13"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke="#fff" strokeWidth="2"/></svg>
          </span>NexChat
        </a>
        <span style={{ color: 'rgba(255,255,255,.2)' }}>|</span>
        <a className={`nav-link ${isGeneralActive() ? 'active' : ''}`} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>General</a>
        <a className={`nav-link ${isAdminActive() ? 'active' : ''}`} onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>Admin</a>
        <a className={`nav-link ${isUserActive() ? 'active' : ''}`} onClick={() => navigate('/user')} style={{ cursor: 'pointer' }}>User</a>
      </div>
    </nav>
  );
};

export default DevTopbar;
