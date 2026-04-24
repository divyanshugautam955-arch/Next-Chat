import React from 'react';

const About = () => {
    return (
        <div id="gpage-about" className="g-page active">
            <div className="py-5 text-white text-center" style={{ background: '#1E3A5F' }}>
                <div className="container">
                    <span className="section-tag" style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.85)', border: 'none' }}>About NexChat</span>
                    <h2 className="display-6 fw-bold mt-3 mb-3">Built for real conversations</h2>
                    <p className="mx-auto" style={{ maxWidth: '520px', opacity: .7, fontSize: '15px', lineHeight: 1.7 }}>NexChat was built as a final year project to demonstrate a production-grade real-time communication system with admin controls, user management, and modern UI.</p>
                </div>
            </div>
            <div className="container py-5">
                <div className="row g-4 mb-4">
                    <div className="col-md-6">
                        <h6 className="fw-bold mb-2">Our Mission</h6>
                        <p className="text-muted" style={{ fontSize: '14px', lineHeight: 1.8 }}>To create a seamless, secure, and intuitive messaging experience that empowers teams and communities to communicate without friction — from one-on-one chats to large group rooms.</p>
                    </div>
                    <div className="col-md-6">
                        <h6 className="fw-bold mb-2">The Technology</h6>
                        <p className="text-muted" style={{ fontSize: '14px', lineHeight: 1.8 }}>NexChat is built with modern web technologies — real-time WebSocket messaging, end-to-end encryption, REST APIs, responsive frontend design, and a robust admin panel.</p>
                    </div>
                </div>
                <div className="p-4 mb-4 rounded-3" style={{ background: 'var(--nc-blue-50)', border: '1px solid var(--nc-blue-100)' }}>
                    <h6 className="fw-bold mb-3" style={{ color: 'var(--nc-blue-dark)' }}>System Zones</h6>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="bg-white rounded-3 p-3 border" style={{ borderColor: 'var(--nc-blue-100)!important' }}>
                                <div className="fw-semibold small mb-1" style={{ color: 'var(--nc-blue)' }}>Admin Zone</div>
                                <div className="small text-muted">Dashboard, user management, chat monitoring, moderation, and analytics.</div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="bg-white rounded-3 p-3 border" style={{ borderColor: 'var(--nc-blue-100)!important' }}>
                                <div className="fw-semibold small mb-1" style={{ color: 'var(--nc-blue)' }}>User Zone</div>
                                <div className="small text-muted">Messaging, group chats, file sharing, calls, and notifications.</div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="bg-white rounded-3 p-3 border" style={{ borderColor: 'var(--nc-blue-100)!important' }}>
                                <div className="fw-semibold small mb-1" style={{ color: 'var(--nc-blue)' }}>General Zone</div>
                                <div className="small text-muted">Public homepage, registration, login, about, help, and contact pages.</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row g-3 text-center">
                    <div className="col-6 col-md-3"><div className="p-4 rounded-3 bg-light"><div className="fs-4 fw-bold" style={{ color: 'var(--nc-blue)' }}>12K+</div><small className="text-muted">Active Users</small></div></div>
                    <div className="col-6 col-md-3"><div className="p-4 rounded-3 bg-light"><div className="fs-4 fw-bold" style={{ color: 'var(--nc-blue)' }}>4.9M</div><small className="text-muted">Messages Sent</small></div></div>
                    <div className="col-6 col-md-3"><div className="p-4 rounded-3 bg-light"><div className="fs-4 fw-bold" style={{ color: 'var(--nc-blue)' }}>99.9%</div><small className="text-muted">Uptime</small></div></div>
                    <div className="col-6 col-md-3"><div className="p-4 rounded-3 bg-light"><div className="fs-4 fw-bold" style={{ color: 'var(--nc-blue)' }}>3</div><small className="text-muted">System Zones</small></div></div>
                </div>
            </div>
        </div>
    );
};

export default About;
