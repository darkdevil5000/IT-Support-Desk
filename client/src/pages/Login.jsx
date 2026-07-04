import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    const res = await login(data.usernameOrEmail, data.password);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center px-4" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="card glass-card p-4 shadow-lg animate-fade-in" style={{ width: '400px' }}>
        <div className="text-center mb-4">
          <div className="bg-primary text-white rounded-circle d-inline-flex p-3 mb-2 shadow-sm">
            <LogIn size={28} />
          </div>
          <h2 className="fw-bold">Welcome Back</h2>
          <p className="text-muted small">Log in to manage IT support requests</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2" role="alert" style={{ fontSize: '0.85rem' }}>
            <ShieldAlert size={16} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted">Username or Email</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-muted">
                <Mail size={16} />
              </span>
              <input
                type="text"
                className={`form-control border-start-0 ${errors.usernameOrEmail ? 'is-invalid' : ''}`}
                placeholder="enter username or email"
                {...register('usernameOrEmail', { required: 'Username or Email is required' })}
              />
              {errors.usernameOrEmail && (
                <div className="invalid-feedback">{errors.usernameOrEmail.message}</div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small fw-semibold text-muted mb-0">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem' }} className="text-primary text-decoration-none">
                Forgot password?
              </Link>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-muted">
                <Key size={16} />
              </span>
              <input
                type="password"
                className={`form-control border-start-0 ${errors.password ? 'is-invalid' : ''}`}
                placeholder="••••••"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password.message}</div>
              )}
            </div>
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
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted small">New user? </span>
          <Link to="/register" className="text-primary text-decoration-none small fw-semibold">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
