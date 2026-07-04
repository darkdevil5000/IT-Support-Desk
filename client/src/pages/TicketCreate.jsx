import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FilePlus, ShieldAlert, CheckCircle, Upload, ArrowLeft } from 'lucide-react';

const TicketCreate = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const ticketRes = await axios.post('/tickets', {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority
      });
      const ticketId = ticketRes.data.id;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        await axios.post(`/tickets/${ticketId}/attachments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setSuccess('Ticket created successfully!');
      setTimeout(() => {
        navigate(`/tickets/${ticketId}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4 animate-fade-in" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="mb-3">
        <Link to="/tickets" className="d-flex align-items-center gap-1 text-decoration-none text-secondary small hover-text-primary">
          <ArrowLeft size={14} />
          <span>Back to Ticket List</span>
        </Link>
      </div>

      <div className="card glass-card p-4 mx-auto" style={{ maxWidth: '700px' }}>
        <div className="d-flex align-items-center gap-3 border-bottom pb-3 mb-4">
          <div className="bg-primary text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px', backgroundColor: 'var(--primary-color)' }}>
            <FilePlus size={24} />
          </div>
          <div>
            <h2 className="fw-bold mb-0">Create IT Ticket</h2>
            <p className="text-muted small mb-0">Describe the issue and our support team will investigate</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
            <ShieldAlert size={16} />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
            <CheckCircle size={16} />
            <div>{success}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted">Ticket Title</label>
            <input
              type="text"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              placeholder="e.g. VPN Access Issue, IntelliJ License Expired"
              {...register('title', { required: 'Title is required', maxLength: { value: 100, message: 'Max 100 characters' } })}
            />
            {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-muted">Category</label>
              <select className={`form-select ${errors.category ? 'is-invalid' : ''}`} {...register('category', { required: 'Category is required' })}>
                <option value="">Select Category</option>
                <option value="SOFTWARE">Software</option>
                <option value="HARDWARE">Hardware</option>
                <option value="NETWORK">Network</option>
                <option value="SECURITY">Security</option>
                <option value="DATABASE">Database</option>
                <option value="EMAIL">Email</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.category && <div className="invalid-feedback">{errors.category.message}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-muted">Priority</label>
              <select className={`form-select ${errors.priority ? 'is-invalid' : ''}`} {...register('priority', { required: 'Priority is required' })}>
                <option value="">Select Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
              {errors.priority && <div className="invalid-feedback">{errors.priority.message}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted">Issue Description</label>
            <textarea
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              rows="5"
              placeholder="Please provide full details, error codes, steps to reproduce, or diagnostic info..."
              {...register('description', { required: 'Description is required' })}
            ></textarea>
            {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-muted">Attachment (Optional, max 10MB)</label>
            <div className="d-flex align-items-center gap-3">
              <label className="btn btn-outline-secondary d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                <Upload size={16} />
                <span>Choose File</span>
                <input type="file" className="d-none" onChange={handleFileChange} />
              </label>
              <span className="text-muted small">
                {selectedFile ? selectedFile.name : 'No file chosen'}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary py-2.5 w-100 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              <span>Submit Ticket</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketCreate;
