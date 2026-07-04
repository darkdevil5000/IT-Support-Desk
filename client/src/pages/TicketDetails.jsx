import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { 
  ArrowLeft, 
  MessageSquare, 
  Paperclip, 
  History, 
  UserCheck, 
  AlertCircle,
  Download,
  Upload,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const TicketDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [history, setHistory] = useState([]);
  const [supportEngineers, setSupportEngineers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [commentText, setCommentText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const fetchDetails = async () => {
    try {
      const ticketRes = await axios.get(`/tickets/${id}`);
      setTicket(ticketRes.data);
      
      const commentsRes = await axios.get(`/tickets/${id}/comments`);
      setComments(commentsRes.data);
      
      const attachmentsRes = await axios.get(`/tickets/${id}/attachments`);
      setAttachments(attachmentsRes.data);
      
      const historyRes = await axios.get(`/tickets/${id}/history`);
      setHistory(historyRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch ticket details.');
    }
  };

  const fetchSupportEngineers = async () => {
    if (user && (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_SUPPORT')) {
      try {
        const res = await axios.get('/users/support');
        setSupportEngineers(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDetails(), fetchSupportEngineers()]);
      setLoading(false);
    };
    init();
  }, [id, user]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await axios.post(`/tickets/${id}/comments`, { commentText });
      setCommentText('');
      fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      await axios.post(`/tickets/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedFile(null);
      document.getElementById('file-upload-input').value = '';
      fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async (assigneeId) => {
    try {
      await axios.put(`/tickets/${id}/assign`, { assigneeId: assigneeId ? Number(assigneeId) : null });
      fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await axios.put(`/tickets/${id}/status`, { status });
      fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEscalate = async () => {
    try {
      await axios.put(`/tickets/${id}/escalate`);
      fetchDetails();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Escalation failed');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <CardSkeleton />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="container-fluid p-4 text-center">
        <div className="alert alert-danger d-inline-block px-4 py-3">
          <ShieldAlert size={24} className="me-2" />
          <span>{error || 'Ticket not found.'}</span>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isSupport = user?.role === 'ROLE_SUPPORT';
  const isEmployee = user?.role === 'ROLE_EMPLOYEE';

  return (
    <div className="container-fluid p-4 animate-fade-in" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="mb-3">
        <Link to="/tickets" className="d-flex align-items-center gap-1 text-decoration-none text-secondary small hover-text-primary">
          <ArrowLeft size={14} />
          <span>Back to Tickets</span>
        </Link>
      </div>

      <div className="card glass-card p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary">#{ticket.id}</span>
              <span className="badge bg-light text-dark">{ticket.category}</span>
            </div>
            <h2 className="fw-bold mb-1">{ticket.title}</h2>
            <p className="text-muted small mb-0">
              Created by <strong>{ticket.createdByFullName}</strong> ({ticket.createdByEmail}) • {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <span className={`badge px-3 py-2 fs-6 ${ticket.priority === 'CRITICAL' ? 'bg-danger text-white' : 'bg-light text-dark'}`}>
              Priority: {ticket.priority}
            </span>
            <span className="badge border border-primary text-primary px-3 py-2 fs-6">
              Status: {ticket.status}
            </span>
          </div>
        </div>
        <hr className="text-secondary" />
        <div>
          <h6 className="fw-bold text-muted small uppercase">Description</h6>
          <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{ticket.description}</p>
        </div>
      </div>

      {(isAdmin || isSupport) && (
        <div className="card glass-card p-3 mb-4">
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <UserCheck size={18} className="text-primary" />
            <span>Support Actions</span>
          </h5>
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <label className="form-label small fw-semibold text-muted mb-1">Assign Support Engineer</label>
              <select
                className="form-select"
                value={ticket.assignedToId || ''}
                onChange={(e) => handleAssign(e.target.value)}
              >
                <option value="">Unassigned</option>
                {supportEngineers.map(eng => (
                  <option key={eng.id} value={eng.id}>{eng.fullName}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold text-muted mb-1">Update Status</label>
              <select
                className="form-select"
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="OPEN">Open</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PENDING">Pending</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="col-md-4 d-flex align-items-end" style={{ height: '58px' }}>
              <button 
                onClick={handleEscalate} 
                disabled={ticket.priority === 'CRITICAL'}
                className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0"
              >
                <AlertCircle size={16} />
                <span>Escalate Priority</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isEmployee && (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
        <div className="card glass-card p-3 mb-4 border-start border-warning border-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h6 className="fw-bold mb-0">Is your issue resolved?</h6>
              <p className="text-muted small mb-0">If the solution works, you can close the ticket. Otherwise, reopen it.</p>
            </div>
            <div className="d-flex gap-2">
              <button onClick={() => handleStatusChange('CLOSED')} className="btn btn-success btn-sm border-0">Close Ticket</button>
              <button onClick={() => handleStatusChange('OPEN')} className="btn btn-warning btn-sm border-0">Reopen Ticket</button>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        <div className="col-md-8">
          <div className="card glass-card p-4 mb-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <MessageSquare size={18} className="text-primary" />
              <span>Discussion Logs</span>
            </h5>
            <div className="d-flex flex-column gap-3 mb-4 overflow-auto" style={{ maxHeight: '350px' }}>
              {comments.length === 0 ? (
                <div className="text-center text-muted py-4">No comments posted yet. Add a note to start discussion.</div>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="p-3 rounded-4 bg-light border">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fw-bold text-dark">{c.user.fullName} ({c.user.role.name.replace('ROLE_', '')})</span>
                      <span className="text-muted small">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mb-0 text-dark">{c.commentText}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handlePostComment}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type a message or comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary border-0" style={{ backgroundColor: 'var(--primary-color)' }}>Send</button>
              </div>
            </form>
          </div>

          <div className="card glass-card p-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Paperclip size={18} className="text-primary" />
              <span>Attachments Logs</span>
            </h5>
            <div className="row g-2 mb-3">
              {attachments.length === 0 ? (
                <div className="text-muted col-12 text-center py-2">No attachments uploaded yet.</div>
              ) : (
                attachments.map(att => (
                  <div key={att.id} className="col-md-6">
                    <div className="border rounded p-2 d-flex align-items-center justify-content-between bg-light">
                      <div className="d-flex flex-column text-truncate" style={{ maxWidth: '80%' }}>
                        <span className="fw-semibold text-truncate small text-dark" title={att.fileName}>{att.fileName}</span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {(att.fileSize / 1024).toFixed(1)} KB • {att.uploadedBy.fullName}
                        </span>
                      </div>
                      <a
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api/'}tickets/attachments/${att.id}`}
                        download
                        className="btn btn-link text-primary p-0 border-0"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleFileUpload} className="d-flex align-items-center gap-2">
              <input 
                id="file-upload-input" 
                type="file" 
                className="form-control form-control-sm w-70" 
                onChange={(e) => setSelectedFile(e.target.files[0])} 
              />
              <button type="submit" disabled={!selectedFile} className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 border-0">
                <Upload size={14} />
                <span>Upload</span>
              </button>
            </form>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card glass-card p-4 h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <History size={18} className="text-primary" />
              <span>Activity Timeline</span>
            </h5>
            <div className="timeline">
              {history.length === 0 ? (
                <div className="text-muted text-center py-3">No activity logs recorded.</div>
              ) : (
                history.map(h => (
                  <div key={h.id} className="timeline-item text-dark">
                    <div className="timeline-marker"></div>
                    <div className="small">
                      <strong className="text-dark">{h.changedBy.fullName}</strong>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                        Type: {h.changeType} <br />
                        {h.oldValue && h.oldValue !== 'NONE' && <span>{h.oldValue} <ChevronRight size={10} /> </span>}
                        <strong>{h.newValue}</strong>
                      </p>
                      <span className="text-muted text-xs d-block mt-0.5" style={{ fontSize: '0.72rem' }}>
                        {new Date(h.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
