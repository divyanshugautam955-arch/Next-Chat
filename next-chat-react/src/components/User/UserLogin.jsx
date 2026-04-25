import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const UserLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            toast.error("Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/user/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success("Login Successful!");
            navigate('/user');
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid Email or Password");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            toast.error("Please fill all fields");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/user', { name, email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success("Account created!");
            navigate('/user');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to register");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-light" style={{ minHeight: 'calc(100vh - 105px)' }}>
            <div className="row g-4 justify-content-center">
                <div className="col-md-5">
                    <div className="login-card w-100" style={{ maxWidth: '100%' }}>
                        <h5 className="fw-bold mb-1">Sign In</h5>
                        <p className="small text-muted mb-4">Welcome back — continue chatting</p>
                        <div className="mb-3">
                            <label className="form-label-nc">Email</label>
                            <input type="email" className="form-input-nc" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="mb-4">
                            <label className="form-label-nc">Password</label>
                            <input type="password" className="form-input-nc" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                        </div>
                        <button className="submit-btn-nc mb-3" onClick={handleLogin} disabled={loading}>
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                        <p className="text-center small text-muted mb-0">
                            Prefer the main login?{' '}
                            <span style={{ color: 'var(--nc-blue)', cursor: 'pointer' }} onClick={() => navigate('/login')}>
                                Go to /login
                            </span>
                        </p>
                    </div>
                </div>
                <div className="col-md-5">
                    <div className="login-card w-100" style={{ maxWidth: '100%' }}>
                        <h5 className="fw-bold mb-1">Create Account</h5>
                        <p className="small text-muted mb-4">Join Real Time Chat Application for free</p>
                        <div className="mb-2">
                            <label className="form-label-nc">Full Name</label>
                            <input type="text" className="form-input-nc" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="mb-2">
                            <label className="form-label-nc">Email</label>
                            <input type="email" className="form-input-nc" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="mb-2">
                            <label className="form-label-nc">Password</label>
                            <input type="password" className="form-input-nc" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="mb-4">
                            <label className="form-label-nc">Confirm Password</label>
                            <input type="password" className="form-input-nc" placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRegister()} />
                        </div>
                        <button className="submit-btn-nc mb-3" onClick={handleRegister} disabled={loading}>
                            {loading ? "Creating..." : "Create Account"}
                        </button>
                        <p className="text-center small text-muted mb-0">Already have an account? Use the Sign In form.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
