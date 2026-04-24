import React from 'react';

const Contact = () => {
    return (
        <div id="gpage-contact" className="g-page active">
            <div className="bg-light py-5">
                <div className="container" style={{ maxWidth: '900px' }}>
                    <span className="section-tag">Contact & Support</span>
                    <h2 className="fw-bold mt-2 mb-1">Get in touch</h2>
                    <p className="text-muted mb-4">We're here to help. Reach out through any of the channels below or send us a message.</p>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="d-grid gap-3">
                                <div className="bg-white border rounded-3 p-3 d-flex align-items-center gap-3">
                                    <div className="d-grid place-items-center rounded-3" style={{ width: '40px', height: '40px', minWidth: '40px', background: 'var(--nc-blue-50)' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                    </div>
                                    <div><div className="fw-semibold small">Email Support</div><div className="small" style={{ color: 'var(--nc-blue)' }}>support@nexchat.com</div></div>
                                </div>
                                <div className="bg-white border rounded-3 p-3 d-flex align-items-center gap-3">
                                    <div className="d-grid place-items-center rounded-3" style={{ width: '40px', height: '40px', minWidth: '40px', background: '#ECFDF5' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                                    </div>
                                    <div><div className="fw-semibold small">Live Chat</div><div className="small text-muted">Available Mon–Fri, 9am–6pm</div></div>
                                </div>
                                <div className="bg-white border rounded-3 p-3 d-flex align-items-center gap-3">
                                    <div className="d-grid place-items-center rounded-3" style={{ width: '40px', height: '40px', minWidth: '40px', background: '#FFFBEB' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    </div>
                                    <div><div className="fw-semibold small">Help Center</div><div className="small text-muted">Browse articles and FAQs</div></div>
                                </div>
                                <div className="bg-white border rounded-3 p-3">
                                    <div className="fw-semibold small mb-2">Response Times</div>
                                    <div className="d-flex justify-content-between small py-1 border-bottom"><span className="text-muted">General enquiry</span><span className="fw-medium">Within 24 hrs</span></div>
                                    <div className="d-flex justify-content-between small py-1 border-bottom"><span className="text-muted">Technical issue</span><span className="fw-medium">Within 12 hrs</span></div>
                                    <div className="d-flex justify-content-between small py-1"><span className="text-muted">Critical / urgent</span><span className="fw-medium" style={{ color: 'var(--nc-green)' }}>Within 2 hrs</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className="bg-white border rounded-3 p-4">
                                <h6 className="fw-bold mb-3">Send us a message</h6>
                                <div className="row g-2 mb-2">
                                    <div className="col-6"><label className="form-label-nc">First Name</label><input type="text" className="form-input-nc" placeholder="Jane" /></div>
                                    <div className="col-6"><label className="form-label-nc">Last Name</label><input type="text" className="form-input-nc" placeholder="Doe" /></div>
                                </div>
                                <div className="mb-2"><label className="form-label-nc">Email</label><input type="email" className="form-input-nc" placeholder="you@email.com" /></div>
                                <div className="mb-2">
                                    <label className="form-label-nc">Subject</label>
                                    <select className="form-input-nc" style={{ cursor: 'pointer' }}>
                                        <option>General Enquiry</option><option>Technical Support</option><option>Account Issue</option><option>Bug Report</option><option>Other</option>
                                    </select>
                                </div>
                                <div className="mb-3"><label className="form-label-nc">Message</label><textarea className="form-input-nc" rows="4" placeholder="Describe your issue or question…" style={{ resize: 'vertical' }}></textarea></div>
                                <button className="submit-btn-nc">Send Message</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
