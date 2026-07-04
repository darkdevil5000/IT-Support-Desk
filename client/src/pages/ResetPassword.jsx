import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Key, ShieldAlert, CheckCircle, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.post('/auth/reset-password', {
        token: data.token,
        newPassword: data.newPassword
      });
      setSuccess('Password reset successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired recovery token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center px-4" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="card glass-card p-4 shadow-lg animate-fade-in" style={{ width: '400px' }}>
        <div className="mb-3">
          <Link to="/login" className="d-flex align-items-center gap-1 text-decoration-none text-secondary small hover-text-primary">
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </Link>
        </div>

        <div className="text-center mb-4">
          <div className="bg-primary text-white rounded-circle d-inline-flex p-3 mb-2 shadow-sm">
            <Key size={28} />
          </div>
          <h2 className="fw-bold">New Password</h2>
          <p className="text-muted small">Enter the recovery token and your new password</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2" role="alert" style={{ fontSize: '0.85rem' }}>
            <ShieldAlert size={16} />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2" role="alert" style={{ fontSize: '0.85rem' }}>
            <CheckCircle size={16} />
            <div>{success}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted">Recovery Token (UUID)</label>
            <input
              type="text"
              className={`form-control ${errors.token ? 'is-invalid' : ''}`}
              placeholder="Paste token from server logs"
              {...register('token', { required: 'Token is required' })}
            />
            {errors.token && <div className="invalid-feedback">{errors.token.message}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted">New Password</label>
            <input
              type="password"
              className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
              placeholder="••••••"
              {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
            />
            {errors.newPassword && <div className="invalid-feedback">{errors.newPassword.message}</div>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 py-2 mt-2 d-flex align-items-center justify-content-center gap-2 rounded-3"
            style={{ backgroundColor: 'var(--primary-color)', border: 'none' }}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
