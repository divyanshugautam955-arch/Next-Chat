import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const UserLogin = () => {
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
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success("Login Successful!");
            if (data.isAdmin) {
                navigate('/admin/dashboard');
            } else {
                navigate('/user/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid Email or Password");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const { data } = await api.post('/user/google', { credential: credentialResponse.credential });
            toast.success("Google Login Successful!");
            localStorage.setItem('userInfo', JSON.stringify(data));
            if (data.isAdmin) {
                navigate('/admin/dashboard');
            } else {
                navigate('/user/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Google Login Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-light" style={{ minHeight: 'calc(100vh - 105px)' }}>
            <div className="row g-4 justify-content-center">
                <div className="col-md-6 col-lg-5">
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
                        <div className="d-flex justify-content-center mb-3">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => {
                                    toast.error('Google Login Failed');
                                }}
                            />
                        </div>
                        <p className="text-center small text-muted mb-0">
                            Don&apos;t have an account?{' '}
                            <span style={{ color: 'var(--nc-blue)', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/register')}>
                                Register
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
