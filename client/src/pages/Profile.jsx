import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Key, ShieldAlert, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { register: profileRegister, handleSubmit: handleProfileSubmit, setValue, formState: { errors: profileErrors } } = useForm();
  const { register: passwordRegister, handleSubmit: handlePasswordSubmit, reset: resetPasswordForm, formState: { errors: passwordErrors } } = useForm();

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setValue('fullName', user.fullName);
      setValue('phone', user.phone || '');
      setValue('department', user.department || '');
    }
  }, [user, setValue]);

  const onProfileUpdate = async (data) => {
    setProfileMsg({ type: '', text: '' });
    setProfileLoading(true);
    try {
      const res = await axios.put('/users/profile', data);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      
      const storedUser = JSON.parse(localStorage.getItem('user'));
      storedUser.fullName = res.data.fullName;
      storedUser.phone = res.data.phone;
      storedUser.department = res.data.department;
      localStorage.setItem('user', JSON.stringify(storedUser));
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setProfileMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordChange = async (data) => {
    setPasswordMsg({ type: '', text: '' });
    setPasswordLoading(true);
    try {
      await axios.put('/users/change-password', data);
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      resetPasswordForm();
    } catch (err) {
      setPasswordMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to change password. Make sure old password is correct.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4 animate-fade-in" style={{ backgroundColor: 'var(--bg-color)' }}>
      <h1 className="fw-bold mb-4">My Account Profile</h1>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card glass-card p-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <User size={18} className="text-primary" />
              <span>Update Profile Information</span>
            </h5>

            {profileMsg.text && (
              <div className={`alert alert-${profileMsg.type} d-flex align-items-center gap-2`} role="alert">
                {profileMsg.type === 'success' ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
                <div className="text-dark">{profileMsg.text}</div>
              </div>
            )}

            <form onSubmit={handleProfileSubmit(onProfileUpdate)}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted mb-1">Username</label>
                <input type="text" className="form-control bg-light" value={user?.username || ''} disabled />
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>Username cannot be changed.</span>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted mb-1">Email Address</label>
                <input type="email" className="form-control bg-light" value={user?.email || ''} disabled />
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>Email cannot be changed.</span>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted mb-1">Full Name</label>
                <input
                  type="text"
                  className={`form-control ${profileErrors.fullName ? 'is-invalid' : ''}`}
                  {...profileRegister('fullName', { required: 'Full name is required' })}
                />
                {profileErrors.fullName && <div className="invalid-feedback">{profileErrors.fullName.message}</div>}
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-1">Department</label>
                  <input type="text" className="form-control" {...profileRegister('department')} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-1">Phone</label>
                  <input type="text" className="form-control" {...profileRegister('phone')} />
                </div>
              </div>

              <button type="submit" disabled={profileLoading} className="btn btn-primary w-100 border-0" style={{ backgroundColor: 'var(--primary-color)' }}>
                {profileLoading ? 'Updating...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card glass-card p-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Key size={18} className="text-primary" />
              <span>Change Password</span>
            </h5>

            {passwordMsg.text && (
              <div className={`alert alert-${passwordMsg.type} d-flex align-items-center gap-2`} role="alert">
                {passwordMsg.type === 'success' ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
                <div className="text-dark">{passwordMsg.text}</div>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit(onPasswordChange)}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted mb-1">Current Password</label>
                <input
                  type="password"
                  className={`form-control ${passwordErrors.oldPassword ? 'is-invalid' : ''}`}
                  placeholder="••••••"
                  {...passwordRegister('oldPassword', { required: 'Old password is required' })}
                />
                {passwordErrors.oldPassword && <div className="invalid-feedback">{passwordErrors.oldPassword.message}</div>}
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted mb-1">New Password</label>
                <input
                  type="password"
                  className={`form-control ${passwordErrors.newPassword ? 'is-invalid' : ''}`}
                  placeholder="••••••"
                  {...passwordRegister('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                />
                {passwordErrors.newPassword && <div className="invalid-feedback">{passwordErrors.newPassword.message}</div>}
              </div>

              <button type="submit" disabled={passwordLoading} className="btn btn-primary w-100 border-0" style={{ backgroundColor: 'var(--primary-color)' }}>
                {passwordLoading ? 'Changing...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
