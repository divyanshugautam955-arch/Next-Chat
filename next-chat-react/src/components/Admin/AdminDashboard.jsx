import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeNow: 0,
        totalChats: 0,
        flaggedReports: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setStats(data);
            } catch (error) {
                toast.error("Failed to load dashboard stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statItems = [
        { color: "ic-blue", label: "Total Users", val: stats.totalUsers, trend: "trend-up", trendText: "▲ Actual Count", icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></> },
        { color: "ic-green", label: "Active Now", val: stats.activeNow, trend: "trend-up", trendText: "▲ Estimated", icon: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></> },
        { color: "ic-amber", label: "Chat Sessions", val: stats.totalChats, trend: "trend-up", trendText: "▲ Database Total", icon: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /> },
        { color: "ic-red", label: "Flagged Reports", val: stats.flaggedReports, trend: "trend-dn", trendText: "▼ Review Needed", icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
    ];

    return (
        <div className="panel active">
            <div className="dash-body">
                <div className="page-intro"><h2>System Overview</h2><p>Live metrics and system health</p></div>
                <div className="row g-3 mb-4">
                    {statItems.map((stat, idx) => (
                        <div className="col-6 col-xl-3" key={idx}>
                            <div className="stat-card">
                                <div className={`stat-card-icon ${stat.color}`}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{stat.icon}</svg>
                                </div>
                                <div className="stat-card-label">{stat.label}</div>
                                <div className="stat-card-val">{loading ? "..." : stat.val}</div>
                                <div className={`stat-card-trend ${stat.trend}`}>{stat.trendText}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="row g-3 mb-4">
                    <div className="col-md-7">
                        <div className="nc-card h-100">
                            <div className="card-head d-flex justify-content-between align-items-center">
                                <span className="card-title">Message Activity (7 days)</span><span className="card-action">Export</span>
                            </div>
                            <div className="nc-card-body">
                                <div className="fs-4 fw-bold text-dark">{stats.totalMessages || 0}</div>
                                <div className="small text-muted mb-3">Total messages sent</div>
                                <div className="mini-bars">
                                    {[40, 55, 70, 90, 75, 85, 100].map((h, i) => (
                                        <span key={i} className={`mini-bar ${h >= 90 ? 'hi' : ''}`} style={{ height: `${h}%` }}></span>
                                    ))}
                                </div>
                                <div className="d-flex justify-content-between mt-1" style={{ fontSize: '10px', color: 'var(--nc-gray-400)' }}>
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="nc-card h-100">
                            <div className="card-head d-flex justify-content-between align-items-center">
                                <span className="card-title">System Status</span><span className="card-action">Details</span>
                            </div>
                            <div className="nc-card-body">
                                <div className="online-item d-flex align-items-center gap-2">
                                    <span className="avatar sm green">S</span>
                                    <span className="online-dot"></span>
                                    <span className="online-name flex-grow-1">Server Online</span>
                                    <span className="online-time">99.9%</span>
                                </div>
                                <div className="online-item d-flex align-items-center gap-2">
                                    <span className="avatar sm blue">D</span>
                                    <span className="online-dot"></span>
                                    <span className="online-name flex-grow-1">Database Connected</span>
                                    <span className="online-time">Stable</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
