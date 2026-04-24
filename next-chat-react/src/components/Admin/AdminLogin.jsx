import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdminLogin = async () => {
        if (!email || !password) {
            toast.error("Please fill all fields");
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/user/login', { email, password });
            if (!data.isAdmin) {
                toast.error("Access Denied: Not an Admin");
                return;
            }
            toast.success("Admin Login Successful!");
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/admin');
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid Credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 105px)', padding: '40px 24px', background: 'var(--nc-gray-50)' }}>
            <div className="login-card">
                <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="logo-icon"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke="#fff" strokeWidth="2" /></svg></span>
                    <span style={{ color: 'var(--nc-gray-900)', fontWeight: 600, fontSize: '15px' }}>NexChat Admin</span>
                </div>
                <h5 className="fw-bold mb-1">Admin Sign In</h5>
                <p className="small text-muted mb-4">Restricted access — authorised personnel only</p>
                <div className="mb-3">
                    <label className="form-label-nc">Admin Email</label>
                    <input type="email" className="form-input-nc" placeholder="admin@nexchat.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label-nc">Password</label>
                    <input type="password" className="form-input-nc" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button className="submit-btn-nc mb-3" onClick={handleAdminLogin} disabled={loading}>
                    {loading ? "Authenticating..." : "Sign In to Admin Panel"}
                </button>
                <p className="text-center small text-muted mb-0">Forgot credentials? <span style={{ color: 'var(--nc-blue)', cursor: 'pointer' }}>Contact IT Support</span></p>
            </div>
        </div>
    );
};

export default AdminLogin;
