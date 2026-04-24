import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data);
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/admin/users/${id}`);
            toast.success("User deleted successfully");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const getStatusBadge = (user) => {
        if (user.isAdmin) return "badge-amber";
        return "badge-green";
    };

    return (
        <div className="panel active">
            <div className="dash-body">
                <div className="page-intro"><h2>User Management</h2><p>Activate, deactivate, or block users</p></div>
                <div className="nc-card">
                    <div className="card-head d-flex justify-content-between align-items-center">
                        <span className="card-title">All Users ({users.length})</span>
                        <div className="d-flex gap-2">
                            <button className="act-btn act-btn-blue" onClick={fetchUsers}>Refresh</button>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="tbl">
                            <thead><tr><th>User</th><th>Email</th><th>Joined</th><th>Role</th><th>Actions</th></tr></thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-4">Loading users...</td></tr>
                                ) : users.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="tbl-avatar">
                                                <span className={`avatar sm ${user.isAdmin ? 'red' : 'green'}`}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span> 
                                                {user.name}
                                            </div>
                                        </td>
                                        <td className="text-muted">{user.email}</td>
                                        <td className="text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td><span className={`badge-nc ${getStatusBadge(user)}`}>{user.isAdmin ? "Admin" : "User"}</span></td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                {!user.isAdmin && (
                                                    <button className="act-btn act-btn-red" onClick={() => handleDelete(user._id)}>Delete</button>
                                                )}
                                                {user.isAdmin && <span className="small text-muted">Protected</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
