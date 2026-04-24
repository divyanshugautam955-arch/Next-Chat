import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            toast.error("Please fill all fields");
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/user/login', { email, password });
            toast.success("Login Successful!");
            localStorage.setItem('userInfo', JSON.stringify(data));
            if (data.isAdmin) {
                navigate('/admin');
            } else {
                navigate('/user/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid Email or Password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="gpage-login" className="g-page active">
            <div className="bg-light py-5 min-vh-100">
                <div className="container d-flex justify-content-center align-items-start pt-4">
                    <div className="login-card">
                        <div className="text-center mb-4">
                            <span className="logo-icon d-block mx-auto mb-3" style={{ width: '44px', height: '44px', borderRadius: '12px' }}>
                                <svg viewBox="0 0 24 24" width="22" height="22"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke="#fff" strokeWidth="2" /></svg>
                            </span>
                            <h5 className="fw-bold mb-1">Welcome back</h5>
                            <p className="text-muted small mb-0">Sign in to your NexChat account</p>
                        </div>
                        <div className="mb-3">
                            <label className="form-label-nc">Email Address</label>
                            <input type="email" className="form-input-nc" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <div className="d-flex justify-content-between mb-1">
                                <label className="form-label-nc mb-0">Password</label>
                            </div>
                            <input type="password" className="form-input-nc" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <button className="submit-btn-nc mb-3" onClick={handleLogin} disabled={loading}>
                            {loading ? "Signing In..." : "Sign In to NexChat"}
                        </button>
                        <p className="text-center small text-muted mb-0">Don't have an account? <span style={{ color: 'var(--nc-blue)', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/register')}>Create one free →</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
