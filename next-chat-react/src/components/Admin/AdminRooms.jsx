import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AdminRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRooms = async () => {
        try {
            const { data } = await api.get('/admin/chats');
            setRooms(data.filter(r => !r.isGroupChat));
        } catch (error) {
            toast.error("Failed to fetch rooms");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (chatId) => {
        if (!window.confirm("Are you sure you want to delete this room?")) return;
        try {
            await api.delete(`/admin/chats/${chatId}`);
            setRooms(rooms.filter(r => r._id !== chatId));
            toast.success("Room deleted successfully");
        } catch (error) {
            toast.error("Failed to delete room");
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    return (
        <div className="panel active">
            <div className="dash-body">
                <div className="page-intro"><h2>Rooms</h2><p>View and manage direct communication channels</p></div>
                <div className="nc-card">
                    <div className="card-head d-flex justify-content-between align-items-center">
                        <span className="card-title">All Rooms ({rooms.length})</span>
                        <div className="d-flex gap-2">
                            <button className="act-btn act-btn-blue" onClick={fetchRooms}>Refresh</button>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="tbl">
                            <thead><tr><th>Participants</th><th>Emails</th><th>Members</th><th>Type</th><th>Actions</th></tr></thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-4">Loading rooms...</td></tr>
                                ) : rooms.map((room) => (
                                    <tr key={room._id}>
                                        <td>
                                            <div className="tbl-avatar">
                                                <span className="avatar sm purple">@</span> 
                                                {room.users?.length >= 2 ? `${room.users[0].name} & ${room.users[1].name}` : (room.users?.[0]?.name || room.chatName)}
                                            </div>
                                        </td>
                                        <td className="text-muted">
                                            {room.users?.length >= 2 ? `${room.users[0].email}, ${room.users[1].email}` : (room.users?.[0]?.email || "N/A")}
                                        </td>
                                        <td className="text-muted">{room.users.length} users</td>
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

export default AdminRooms;
