import React from 'react';

const Help = () => {
    return (
        <div id="gpage-help" className="g-page active">
            <div className="bg-light py-5">
                <div className="container" style={{ maxWidth: '800px' }}>
                    <span className="section-tag">Help Center</span>
                    <h2 className="fw-bold mt-2 mb-1">How can we help?</h2>
                    <p className="text-muted mb-4">Browse topics or search for answers.</p>
                    <div className="input-group mb-4 shadow-sm" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                        <span className="input-group-text bg-white border-end-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        </span>
                        <input className="form-control border-start-0 ps-0" placeholder="Search help articles…" style={{ fontSize: '14px' }} />
                    </div>
                    <div className="row g-3 mb-4">
                        {[
                            { color: '#EFF6FF', stroke: '#3B82F6', icon: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />, title: "Getting Started", desc: "Set up your account and start chatting in minutes." },
                            { color: '#ECFDF5', stroke: '#10B981', icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></>, title: "Account & Profile", desc: "Manage your settings, avatar, password, and privacy." },
                            { color: '#FFFBEB', stroke: '#F59E0B', icon: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></>, title: "Video & Audio Calls", desc: "Troubleshoot calls, permissions, and audio issues." },
                            { color: '#FEF2F2', stroke: '#EF4444', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, title: "Security & Privacy", desc: "Learn about encryption, 2FA, and data protection." },
                        ].map((topic, idx) => (
                            <div className="col-md-6" key={idx}>
                                <div className="bg-white border rounded-3 p-3 h-100" style={{ cursor: 'pointer' }}>
                                    <div className="d-grid place-items-center rounded-3 mb-3" style={{ width: '36px', height: '36px', background: topic.color }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={topic.stroke} strokeWidth="2">{topic.icon}</svg>
                                    </div>
                                    <div className="fw-semibold mb-1" style={{ fontSize: '14px' }}>{topic.title}</div>
                                    <div className="small text-muted">{topic.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border rounded-3 overflow-hidden">
                        <div className="px-3 py-2 border-bottom fw-semibold" style={{ fontSize: '14px' }}>Popular Articles</div>
                        {[
                            "How to create a group chat room",
                            "How to share files and media",
                            "How to start a video call",
                            "How to set up two-factor authentication"
                        ].map((article, idx) => (
                            <div key={idx} className={`px-3 py-2 ${idx !== 3 ? 'border-bottom' : ''} small d-flex align-items-center gap-2`} style={{ cursor: 'pointer' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /></svg> {article}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Help;
