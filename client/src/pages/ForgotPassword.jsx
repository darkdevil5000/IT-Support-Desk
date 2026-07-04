import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, ShieldAlert, CheckCircle, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
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
      await axios.post('/auth/forgot-password', { email: data.email });
      setSuccess('Simulated recovery email sent! Please check the backend console/logs to copy the generated UUID token.');
      setTimeout(() => {
        navigate('/reset-password');
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please check your email.');
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
            <Mail size={28} />
          </div>
          <h2 className="fw-bold">Reset Password</h2>
          <p className="text-muted small">Enter your email and we'll generate a recovery token</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2" role="alert" style={{ fontSize: '0.85rem' }}>
            <ShieldAlert size={16} />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="alert alert-success d-flex align-items-start gap-2" role="alert" style={{ fontSize: '0.85rem' }}>
            <CheckCircle size={16} className="mt-1 flex-shrink-0" />
            <div>
              <strong>{success}</strong>
              <p className="mb-0 mt-1">Redirecting you to the Reset Page in a few seconds...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted">Email Address</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="name@itdesk.com"
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
              })}
            />
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
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
              <span>Send Recovery Token</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
