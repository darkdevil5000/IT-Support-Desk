import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { Users, Trash2, ShieldAlert, CheckCircle } from 'lucide-react';

const AdminPanel = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/users');
      setUsersList(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: 'Failed to retrieve users. Access restricted to Admin only.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setMessage({ type: '', text: '' });
    try {
      await axios.put(`/users/${userId}/role`, { role: newRole });
      setMessage({ type: 'success', text: 'User role updated successfully!' });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to update role.' });
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) return;
    setMessage({ type: '', text: '' });
    try {
      await axios.delete(`/users/${userId}`);
      setMessage({ type: 'success', text: `User "${username}" has been deleted.` });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to delete user.' });
    }
  };

  return (
    <div className="container-fluid p-4 animate-fade-in" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-primary text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px', backgroundColor: 'var(--primary-color)' }}>
          <Users size={24} />
        </div>
        <div>
          <h1 className="fw-bold mb-1">User Administration</h1>
          <p className="text-muted small mb-0">View system accounts, change access roles, and remove users</p>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} d-flex align-items-center gap-2`} role="alert">
          {message.type === 'success' ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
          <div className="text-dark">{message.text}</div>
        </div>
      )}

      <div className="card glass-card p-4">
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle border-0">
              <thead>
                <tr className="border-bottom">
                  <th>ID</th>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Access Role</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} className="border-bottom">
                    <td className="fw-semibold">#{u.id}</td>
                    <td className="fw-medium">{u.username}</td>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>{u.department || 'N/A'}</td>
                    <td>
                      <span className={`badge ${u.status === 'ACTIVE' ? 'bg-success text-white' : 'bg-secondary'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm w-auto"
                        value={u.role.name}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="ROLE_EMPLOYEE">EMPLOYEE</option>
                        <option value="ROLE_SUPPORT">SUPPORT</option>
                        <option value="ROLE_ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        className="btn btn-sm btn-outline-danger border-0 d-inline-flex align-items-center gap-1"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
