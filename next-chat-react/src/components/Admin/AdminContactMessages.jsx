import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AdminContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPollingError, setIsPollingError] = useState(false);
    const [expandedMessageId, setExpandedMessageId] = useState(null);

    const fetchMessages = async ({ showErrorToast = true, isInitial = false } = {}) => {
        if (isInitial) {
            setLoading(true);
        }
        try {
            const { data } = await api.get('/admin/contact-messages');
            setMessages(data);
            setIsPollingError(false);
        } catch (error) {
            if (showErrorToast) {
                toast.error(error.response?.data?.message || "Failed to fetch contact messages");
            }
            setIsPollingError(true);
        } finally {
            if (isInitial) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchMessages({ isInitial: true });
        const intervalId = window.setInterval(() => {
            fetchMessages({ showErrorToast: false });
        }, 5000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, []);

    return (
        <div className="panel active">
            <div className="dash-body">
                <div className="page-intro"><h2>Contact Messages</h2><p>View all messages submitted from the contact form</p></div>
                <div className="nc-card">
                    <div className="card-head d-flex justify-content-between align-items-center">
                        <span className="card-title">All Contact Messages ({messages.length})</span>
                        <div className="d-flex gap-2">
                            {isPollingError && <span className="small text-danger align-self-center">Auto-refresh paused. Try manual refresh.</span>}
                            <button className="act-btn act-btn-blue" onClick={() => fetchMessages({ isInitial: true })}>Refresh</button>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="tbl">
                            <thead>
                                <tr>
                                    <th>Sender</th>
                                    <th>Email</th>
                                    <th>Subject</th>
                                    <th>Message</th>
                                    <th>Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">Loading contact messages...</td>
                                    </tr>
                                ) : messages.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-muted">No contact messages yet.</td>
                                    </tr>
                                ) : (
                                    messages.map((item) => (
                                        <tr key={item._id}>
                                            <td>{`${item.firstName} ${item.lastName}`}</td>
                                            <td className="text-muted">{item.email}</td>
                                            <td>{item.subject}</td>
                                            <td style={{ maxWidth: '320px' }}>
                                                <div
                                                    title={item.message}
                                                    onClick={() => setExpandedMessageId((prev) => (prev === item._id ? null : item._id))}
                                                    style={{
                                                        cursor: 'pointer',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                        overflowWrap: 'anywhere',
                                                        maxWidth: '320px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: expandedMessageId === item._id ? 'unset' : 3,
                                                        WebkitBoxOrient: 'vertical',
                                                    }}
                                                >
                                                    {item.message}
                                                </div>
                                            </td>
                                            <td className="text-muted">{new Date(item.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminContactMessages;
