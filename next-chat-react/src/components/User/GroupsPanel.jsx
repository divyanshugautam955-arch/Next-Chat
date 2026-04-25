import React, { useMemo, useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const GroupsPanel = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [userQuery, setUserQuery] = useState('');
    const [userLoading, setUserLoading] = useState(false);
    const [userResults, setUserResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [creating, setCreating] = useState(false);
    const navigate = useNavigate();

    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/chat');
            const realGroups = data.filter(c => c.isGroupChat);
            setGroups(Array.isArray(realGroups) ? realGroups : []);
        } catch (error) {
            setGroups([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const resetCreate = () => {
        setGroupName('');
        setUserQuery('');
        setUserResults([]);
        setSelectedUsers([]);
        setCreating(false);
        setUserLoading(false);
    };

    const closeCreate = () => {
        setCreateOpen(false);
        resetCreate();
    };

    const searchUsers = async (q) => {
        setUserQuery(q);
        if (!q || q.trim().length < 2) {
            setUserResults([]);
            return;
        }

        try {
            setUserLoading(true);
            const { data } = await api.get(`/user?search=${encodeURIComponent(q.trim())}`);
            setUserResults(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to search users");
            setUserResults([]);
        } finally {
            setUserLoading(false);
        }
    };

    const addUser = (u) => {
        if (!u?._id) return;
        if (selectedUsers.find(s => s._id === u._id)) return;
        setSelectedUsers(prev => [...prev, u]);
    };

    const removeUser = (id) => {
        setSelectedUsers(prev => prev.filter(u => u._id !== id));
    };

    const canCreate = useMemo(() => {
        return Boolean(groupName.trim()) && selectedUsers.length >= 2 && !creating;
    }, [groupName, selectedUsers.length, creating]);

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return toast.error("Enter a group name");
        if (selectedUsers.length < 2) return toast.error("Select at least 2 users");

        try {
            setCreating(true);
            const payload = {
                name: groupName.trim(),
                users: JSON.stringify(selectedUsers.map(u => u._id)),
            };
            const { data } = await api.post('/chat/group', payload);
            toast.success("Group created");
            closeCreate();
            await fetchGroups();
            navigate('/user', { state: { selectedChat: data } });
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data || "Failed to create group");
        } finally {
            setCreating(false);
        }
    };

    const handleLeaveGroup = async (group) => {
        if (!window.confirm(`Are you sure you want to leave "${group.chatName}"?`)) return;

        try {
            await api.put('/chat/groupremove', {
                chatId: group._id,
                userId: userInfo._id
            });
            toast.success("Left group successfully");
            fetchGroups();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to leave group");
        }
    };

    const getAvatarColor = (name) => {
        const colors = ['purple', 'blue', 'orange', 'pink'];
        const charCode = (name?.[0]?.toUpperCase()?.charCodeAt(0) || 0) % colors.length;
        return colors[charCode];
    };

    return (
        <div className="panel active">
            <div className="dash-body">
                <div className="page-intro"><h2>Group Channels</h2><p>Your collaborative spaces and rooms</p></div>
                <div className="nc-card">
                    <div className="card-head d-flex justify-content-between align-items-center">
                        <span className="card-title">My Groups ({groups.length})</span>
                        <div className="d-flex gap-2">
                             <button className="act-btn act-btn-gray btn-sm" onClick={fetchGroups}>Sync</button>
                             <button className="act-btn act-btn-blue btn-sm" onClick={() => setCreateOpen(true)}>+ Create Group</button>
                        </div>
                    </div>

                    {createOpen && (
                        <div className="nc-card-body border-bottom" style={{ background: 'var(--nc-gray-50)' }}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="fw-bold">Create a new group</div>
                                <button className="act-btn act-btn-gray btn-sm" onClick={closeCreate} disabled={creating}>Close</button>
                            </div>

                            <div className="row g-2">
                                <div className="col-md-4">
                                    <label className="form-label-nc">Group name</label>
                                    <input
                                        className="form-input-nc"
                                        placeholder="e.g. project-alpha"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <label className="form-label-nc">Add members</label>
                                    <input
                                        className="form-input-nc"
                                        placeholder="Search users by name or email (min 2 chars)…"
                                        value={userQuery}
                                        onChange={(e) => searchUsers(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="mt-3">
                                <div className="small text-muted mb-2">Selected members ({selectedUsers.length})</div>
                                <div className="d-flex flex-wrap gap-2">
                                    {selectedUsers.length === 0 ? (
                                        <div className="small text-muted">No users selected.</div>
                                    ) : selectedUsers.map(u => (
                                        <span key={u._id} className="badge-nc badge-gray d-inline-flex align-items-center gap-2" style={{ padding: '6px 10px' }}>
                                            <span className={`avatar sm ${getAvatarColor(u.name)}`}>{(u.name?.[0] || 'U').toUpperCase()}</span>
                                            <span className="small">{u.name}</span>
                                            <span className="small text-muted">{u.email}</span>
                                            <button className="act-btn act-btn-red btn-sm" style={{ padding: '2px 8px' }} onClick={() => removeUser(u._id)} disabled={creating}>×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-3">
                                <div className="small text-muted mb-2">Search results</div>
                                <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                    {userLoading ? (
                                        <div className="text-muted small py-2"><div className="spinner-border spinner-border-sm me-2"></div>Searching…</div>
                                    ) : userResults.length === 0 ? (
                                        <div className="text-muted small py-2">Type to search users.</div>
                                    ) : userResults.map(u => (
                                        <div key={u._id} className="d-flex align-items-center justify-content-between py-2 px-2 rounded hover-effect" style={{ background: '#fff' }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <span className={`avatar sm ${getAvatarColor(u.name)}`}>{(u.name?.[0] || 'U').toUpperCase()}</span>
                                                <div className="d-flex flex-column">
                                                    <span className="small fw-medium text-dark">{u.name}</span>
                                                    <span className="small text-muted" style={{ fontSize: '10px' }}>{u.email}</span>
                                                </div>
                                            </div>
                                            <button className="act-btn act-btn-blue btn-sm" onClick={() => addUser(u)} disabled={creating || !!selectedUsers.find(s => s._id === u._id)}>
                                                {selectedUsers.find(s => s._id === u._id) ? "Added" : "Add"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="d-flex justify-content-end mt-3">
                                <button className="act-btn act-btn-blue" onClick={handleCreateGroup} disabled={!canCreate}>
                                    {creating ? "Creating..." : "Create Group"}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="table-responsive">
                        <table className="tbl">
                            <thead><tr><th>Channel</th><th>Members</th><th>Last Activity</th><th>Manager</th><th>Action</th></tr></thead>
                            <tbody>
                                {loading && groups.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2"></div> Fetching groups...</td></tr>
                                ) : groups.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-5 text-muted">No groups found. Create one to begin.</td></tr>
                                ) : groups.map((group, idx) => (
                                    <tr key={group._id || idx}>
                                        <td>
                                            <div className="tbl-avatar">
                                                <span className={`avatar sm ${getAvatarColor(group.chatName)}`}>#</span>
                                                <div className="d-flex flex-column">
                                                    <span className="fw-medium text-dark">{group.chatName}</span>
                                                    <small className="text-muted" style={{fontSize: '10px'}}>{group.isShared ? 'Public Channel' : 'Private Group'}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge-nc badge-gray">{group.users.length}</span></td>
                                        <td className="text-muted small text-truncate" style={{maxWidth: '200px'}}>
                                            {group.latestMessage
                                                ? `${group.latestMessage.sender?.name || "User"}: ${group.latestMessage.content || ""}`
                                                : "Start a conversation"}
                                        </td>
                                        <td><span className="small">{group.groupAdmin?.name || "N/A"}</span></td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button 
                                                    className="act-btn act-btn-blue btn-sm" 
                                                    onClick={() => navigate('/user', { state: { selectedChat: group } })}
                                                >
                                                    Open
                                                </button>
                                                <button 
                                                    className="act-btn act-btn-red btn-sm" 
                                                    onClick={() => handleLeaveGroup(group)}
                                                >
                                                    Leave
                                                </button>
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

export default GroupsPanel;
