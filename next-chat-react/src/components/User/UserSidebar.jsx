import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const UserSidebar = ({ className = "" }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className={`nc-sidebar ${className}`}>
            <div className="sidebar-logo d-flex align-items-center gap-2">
                <span className="logo-icon"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke="#fff" strokeWidth="2" /></svg></span>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>Real Time Chat Application</span>
                <span style={{ background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.7)', fontSize: '10px', padding: '2px 7px', borderRadius: '20px' }}>User</span>
            </div>
            <div className="sidebar-section">Main</div>

            <span className={`nav-link ${isActive('/user/dashboard')}`} onClick={() => navigate('/user/dashboard')}>
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                Dashboard
            </span>
            <span className={`nav-link ${isActive('/user')}`} onClick={() => navigate('/user')}>
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                Messages
            </span>
            <span className={`nav-link ${isActive('/user/groups')}`} onClick={() => navigate('/user/groups')}>
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
                Group Chats
            </span>

            <span className={`nav-link ${isActive('/user/calls')}`} onClick={() => navigate('/user/calls')}>
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                Calls
            </span>
            <div className="sidebar-footer" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                <div className="d-flex align-items-center gap-2">
                    <span className="avatar green">{userInfo.name ? userInfo.name.charAt(0) : 'U'}</span>
                    <div>
                        <div style={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>{userInfo.name || 'User'}</div>
                        <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '11px' }}>{userInfo.email || 'Online'}</div>
                    </div>
                    <svg className="ms-auto" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 01-2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                </div>
            </div>
        </div>
    );
};

export default UserSidebar;
