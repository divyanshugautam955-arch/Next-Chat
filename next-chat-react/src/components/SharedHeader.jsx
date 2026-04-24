import React, { useEffect, useRef } from 'react';

const SharedHeader = ({ title, sub, type, onToggleNotif, onCloseNotif, onClearNotif, notifOpen, notifications = [], unreadCount = 0 }) => {
    const [accountOpen, setAccountOpen] = React.useState(false);
    const panelRef = useRef(null);
    const accountRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        window.location.href = type === 'admin' ? '/admin/login' : '/login';
    };

    useEffect(() => {
        const onDocDown = (e) => {
            if (notifOpen && panelRef.current && !panelRef.current.contains(e.target)) {
                onCloseNotif?.();
            }
            if (accountOpen && accountRef.current && !accountRef.current.contains(e.target)) {
                setAccountOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocDown);
        return () => document.removeEventListener('mousedown', onDocDown);
    }, [notifOpen, onCloseNotif, accountOpen]);

    const formatTime = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
        } catch {
            return '';
        }
    };

    return (
        <div className="nc-header d-flex align-items-center gap-3">
            <div>
                <div className="header-title">{title}</div>
                <div className="header-sub">{sub}</div>
            </div>
            <div className="d-flex align-items-center gap-2 position-relative ms-auto">
                <button className="icon-btn btn-notif" onClick={onToggleNotif}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
                    {unreadCount > 0 && <div className="notif-dot"></div>}
                </button>
                
                {notifOpen && (
                    <div ref={panelRef} className="notif-panel show" id="notif-panel" style={{ top: '45px', right: '0' }}>
                        <div className="notif-head">
                            Notifications {unreadCount > 0 ? <span className="badge-nc badge-blue ms-2">{unreadCount}</span> : null}
                            <span className="notif-clear cursor-pointer" onClick={onClearNotif}>Clear all</span>
                        </div>

                        {type === 'admin' ? (
                            <div className="text-muted small p-3">Admin notifications are not wired yet.</div>
                        ) : notifications.length === 0 ? (
                            <div className="text-muted small p-3">No notifications yet.</div>
                        ) : (
                            notifications.slice(0, 10).map((n) => (
                                <div key={n.id} className="notif-item d-flex align-items-start gap-2">
                                    <span className={`avatar sm ${n.color || 'purple'}`}>{n.initials || 'N'}</span>
                                    <div>
                                        <div className="notif-text">{n.text}</div>
                                        <div className="notif-time">{formatTime(n.createdAt)}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                <span style={{ width: '1px', height: '24px', background: 'var(--nc-gray-200)' }}></span>
                <div className="position-relative" ref={accountRef}>
                    {(() => {
                        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
                        const initials = userInfo.name ? userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : (type === 'admin' ? 'SA' : 'U');
                        return (
                            <span 
                                className={`avatar ${type === 'admin' ? 'red' : 'green'}`} 
                                style={{ cursor: 'pointer' }}
                                onClick={() => setAccountOpen(!accountOpen)}
                            >
                                {initials}
                            </span>
                        );
                    })()}
                    
                    {accountOpen && (
                        <div className="notif-panel show" style={{ top: '45px', right: '0', width: '160px', padding: '8px 0' }}>
                            <div className="px-3 py-2 border-bottom mb-1">
                                <div className="small fw-bold text-dark">Account Settings</div>
                            </div>
                            <div className="notif-item cursor-pointer hover-effect" style={{ border: 'none' }}>
                                <div className="notif-text">View Profile</div>
                            </div>
                            <div className="notif-item cursor-pointer hover-effect" style={{ border: 'none' }}>
                                <div className="notif-text">Settings</div>
                            </div>
                            <div className="notif-item cursor-pointer hover-effect text-danger" style={{ border: 'none' }} onClick={handleLogout}>
                                <div className="notif-text fw-bold">Sign Out</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SharedHeader;
