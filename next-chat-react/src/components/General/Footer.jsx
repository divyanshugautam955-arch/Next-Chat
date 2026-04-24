import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="nc-footer">
            <div className="container pb-4">
                <div className="row g-4">
                    <div className="col-md-4">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <span className="logo-icon"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke="#fff" strokeWidth="2" /></svg></span>
                            <span className="fw-bold" style={{ color: '#fff', fontSize: '16px' }}>NexChat</span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '13px', lineHeight: 1.7 }}>A modern, secure real-time chat system for teams and communities of all sizes.</p>
                    </div>
                    <div className="col-6 col-md-2 footer-col">
                        <h4>Pages</h4>
                        <span className="footer-link" onClick={() => navigate('/')}>Home</span>
                        <span className="footer-link" onClick={() => navigate('/about')}>About</span>
                        <span className="footer-link" onClick={() => navigate('/help')}>Help</span>
                        <span className="footer-link" onClick={() => navigate('/contact')}>Contact</span>
                    </div>
                    <div className="col-6 col-md-2 footer-col">
                        <h4>Account</h4>
                        <span className="footer-link" onClick={() => navigate('/login')}>Login</span>
                        <span className="footer-link" onClick={() => navigate('/register')}>Register</span>
                        <span className="footer-link">Privacy Policy</span>
                        <span className="footer-link">Terms of Service</span>
                    </div>
                    <div className="col-6 col-md-2 footer-col">
                        <h4>Contact</h4>
                        <span className="footer-link">support@nexchat.com</span>
                        <span className="footer-link">Help Center</span>
                        <span className="footer-link">Community</span>
                    </div>
                </div>
                <hr style={{ borderColor: 'rgba(255,255,255,.1)', marginTop: '32px' }} />
                <div className="d-flex justify-content-between align-items-center">
                    <span className="footer-copy">© 2026 NexChat. All rights reserved.</span>
                    <div>
                        <span className="social-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg></span>
                        <span className="social-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg></span>
                        <span className="social-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" /></svg></span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
