import React, { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const Contact = () => {
    const initialFormState = {
        firstName: '',
        lastName: '',
        email: '',
        subject: 'General Enquiry',
        message: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState('');
    const [submitError, setSubmitError] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitSuccess('');
        setSubmitError('');

        if (!formData.firstName || !formData.email || !formData.subject || !formData.message) {
            const message = 'Please fill all required fields.';
            setSubmitError(message);
            toast.error(message);
            return;
        }

        setIsSubmitting(true);
        try {
            const { data } = await api.post('/contact', formData);
            const successMessage = data?.message || 'Your message has been sent successfully.';
            setSubmitSuccess(successMessage);
            toast.success(successMessage);
            setFormData(initialFormState);
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send message. Please try again.';
            setSubmitError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                                    <div><div className="fw-semibold small">Email Support</div><div className="small" style={{ color: 'var(--nc-blue)' }}>admin@nexchat.com</div></div>
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
                                <form onSubmit={handleSubmit}>
                                    {submitSuccess && (
                                        <div className="alert alert-success py-2" role="alert">
                                            {submitSuccess}
                                        </div>
                                    )}
                                    {submitError && (
                                        <div className="alert alert-danger py-2" role="alert">
                                            {submitError}
                                        </div>
                                    )}
                                    <div className="row g-2 mb-2">
                                        <div className="col-6">
                                            <label className="form-label-nc">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                className="form-input-nc"
                                                placeholder="Jane"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label-nc">Last Name <span className="text-muted">(Optional)</span></label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                className="form-input-nc"
                                                placeholder="Doe"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label-nc">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-input-nc"
                                            placeholder="you@email.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label-nc">Subject</label>
                                        <select
                                            name="subject"
                                            className="form-input-nc"
                                            style={{ cursor: 'pointer' }}
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option>General Enquiry</option><option>Technical Support</option><option>Account Issue</option><option>Bug Report</option><option>Other</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label-nc">Message</label>
                                        <textarea
                                            name="message"
                                            className="form-input-nc"
                                            rows="4"
                                            placeholder="Describe your issue or question..."
                                            style={{ resize: 'vertical' }}
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                    </div>
                                    <button className="submit-btn-nc" type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
