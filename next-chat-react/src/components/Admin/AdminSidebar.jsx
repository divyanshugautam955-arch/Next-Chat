import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar = ({ className = "" }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/admin/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className={`nc-sidebar ${className}`}>
            <div className="sidebar-logo d-flex align-items-center gap-2">
                <span className="logo-icon"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke="#fff" strokeWidth="2" /></svg></span>
                <span className="logo-name" style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>Real Time Chat Application</span>
                <span style={{ background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.7)', fontSize: '10px', padding: '2px 7px', borderRadius: '20px' }}>Admin</span>
            </div>
            <div className="sidebar-section">Overview</div>
            <span className={`nav-link ${isActive('/admin')}`} onClick={() => navigate('/admin')}>
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                Dashboard
            </span>

            <div className="sidebar-section">Management</div>
            <span className={`nav-link ${isActive('/admin/users')}`} onClick={() => navigate('/admin/users')}>
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
                User Management
            </span>

            <span className={`nav-link ${isActive('/admin/groups')}`} onClick={() => navigate('/admin/groups')}>
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
                Groups
            </span>

            <span className={`nav-link ${isActive('/admin/rooms')}`} onClick={() => navigate('/admin/rooms')}>
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                Rooms
            </span>
            <span className={`nav-link ${isActive('/admin/contact-messages')}`} onClick={() => navigate('/admin/contact-messages')}>
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                Contact Messages
            </span>
            <div className="sidebar-footer" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                <div className="d-flex align-items-center gap-2">
                    <span className="avatar red">{userInfo.name ? userInfo.name.charAt(0) : 'A'}</span>
                    <div className="user-info">
                        <div style={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>{userInfo.name || 'Admin User'}</div>
                        <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '11px' }}>{userInfo.email || 'administrator'}</div>
                    </div>
                    <svg className="ms-auto" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 01-2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;
