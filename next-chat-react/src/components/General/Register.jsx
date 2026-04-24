import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            toast.error("Please fill all fields");
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/user', { name, email, password });
            toast.success("Registration Successful!");
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/user/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="gpage-register" className="g-page active">
            <div className="bg-light py-5 min-vh-100">
                <div className="container d-flex justify-content-center align-items-start pt-4">
                    <div className="login-card" style={{ maxWidth: '460px' }}>
                        <div className="text-center mb-4">
                            <span className="logo-icon d-block mx-auto mb-3" style={{ width: '44px', height: '44px', borderRadius: '12px' }}>
                                <svg viewBox="0 0 24 24" width="22" height="22"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke="#fff" strokeWidth="2" /></svg>
                            </span>
                            <h5 className="fw-bold mb-1">Create your account</h5>
                            <p className="text-muted small mb-0">Free forever — no credit card needed</p>
                        </div>
                        <div className="mb-2">
                          <label className="form-label-nc">Full Name</label>
                          <input type="text" className="form-input-nc" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="mb-2">
                          <label className="form-label-nc">Email Address</label>
                          <input type="email" className="form-input-nc" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label-nc">Password</label>
                          <input type="password" className="form-input-nc" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <button className="submit-btn-nc mb-3" onClick={handleRegister} disabled={loading}>
                            {loading ? "Registering..." : "Create Free Account"}
                        </button>
                        <p className="text-center small text-muted mb-0">Already have an account? <span style={{ color: 'var(--nc-blue)', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/login')}>Sign in →</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
