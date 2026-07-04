import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, ShieldAlert, CheckCircle } from 'lucide-react';

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: registerApi } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);
    const res = await registerApi(data);
    setLoading(false);
    if (res.success) {
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center px-4" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="card glass-card p-4 shadow-lg animate-fade-in" style={{ width: '450px' }}>
        <div className="text-center mb-4">
          <div className="bg-primary text-white rounded-circle d-inline-flex p-3 mb-2 shadow-sm">
            <UserPlus size={28} />
          </div>
          <h2 className="fw-bold">Create Account</h2>
          <p className="text-muted small">Register for the IT Support Hub Portal</p>
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
          <div className="row g-2 mb-3">
            <div className="col">
              <label className="form-label small fw-semibold text-muted mb-1">Username</label>
              <input
                type="text"
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                placeholder="ankur99"
                {...register('username', { required: 'Username is required', minLength: { value: 3, message: 'Min 3 chars' } })}
              />
              {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}
            </div>
            <div className="col">
              <label className="form-label small fw-semibold text-muted mb-1">Full Name</label>
              <input
                type="text"
                className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                placeholder="Ankur Sutradhar"
                {...register('fullName', { required: 'Full Name is required' })}
              />
              {errors.fullName && <div className="invalid-feedback">{errors.fullName.message}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted mb-1">Email Address</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="ankur@itdesk.com"
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
              })}
            />
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted mb-1">Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="••••••"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
            />
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
          </div>

          <div className="row g-2 mb-3">
            <div className="col">
              <label className="form-label small fw-semibold text-muted mb-1">Department</label>
              <input
                type="text"
                className="form-control"
                placeholder="Engineering"
                {...register('department')}
              />
            </div>
            <div className="col">
              <label className="form-label small fw-semibold text-muted mb-1">Phone</label>
              <input
                type="text"
                className="form-control"
                placeholder="+1234567890"
                {...register('phone')}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted mb-1">Registration Role (Demo)</label>
            <select className="form-select" {...register('role', { required: true })}>
              <option value="ROLE_EMPLOYEE">Employee / End User</option>
              <option value="ROLE_SUPPORT">L1 Support Engineer</option>
              <option value="ROLE_ADMIN">Administrator</option>
            </select>
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
              <span>Sign Up</span>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted small">Already registered? </span>
          <Link to="/login" className="text-primary text-decoration-none small fw-semibold">
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
