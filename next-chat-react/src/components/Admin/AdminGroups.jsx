import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AdminGroups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchGroups = async () => {
        try {
            const { data } = await api.get('/admin/chats');
            setGroups(data.filter(r => r.isGroupChat));
        } catch (error) {
            toast.error("Failed to fetch groups");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (chatId) => {
        if (!window.confirm("Are you sure you want to delete this group?")) return;
        try {
            await api.delete(`/admin/chats/${chatId}`);
            setGroups(groups.filter(g => g._id !== chatId));
            toast.success("Group deleted successfully");
        } catch (error) {
            toast.error("Failed to delete group");
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    return (
        <div className="panel active">
            <div className="dash-body">
                <div className="page-intro"><h2>Groups</h2><p>View and manage group communication channels</p></div>
                <div className="nc-card">
                    <div className="card-head d-flex justify-content-between align-items-center">
                        <span className="card-title">All Groups ({groups.length})</span>
                        <div className="d-flex gap-2">
                            <button className="act-btn act-btn-blue" onClick={fetchGroups}>Refresh</button>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="tbl">
                            <thead><tr><th>Group Name</th><th>Created By</th><th>Members</th><th>Type</th><th>Actions</th></tr></thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-4">Loading groups...</td></tr>
                                ) : groups.map((room) => (
                                    <tr key={room._id}>
                                        <td><div className="tbl-avatar"><span className="avatar sm purple">{room.isGroupChat ? "#" : "@"}</span> {room.chatName}</div></td>
                                        <td className="text-muted">{room.groupAdmin ? room.groupAdmin.name : "N/A"}</td>
                                        <td className="text-muted" style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={room.users.map(u => u.name).join(', ')}>
                                            {room.users.map(u => u.name).join(', ')}
                                        </td>
                                        <td><span className={`badge-nc ${room.isGroupChat ? 'badge-green' : 'badge-blue'}`}>{room.isGroupChat ? "Group" : "Direct"}</span></td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button className="act-btn act-btn-red" onClick={() => handleDelete(room._id)}>Delete</button>
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

export default AdminGroups;
