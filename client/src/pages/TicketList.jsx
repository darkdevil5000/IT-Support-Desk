import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TicketTable from '../components/TicketTable';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const TicketList = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/tickets', {
        params: {
          status: status === 'ALL' ? null : status,
          priority: priority === 'ALL' ? null : priority,
          category: category === 'ALL' ? null : category,
          search: search || null
        }
      });
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [status, priority, category, search]);

  return (
    <div className="container-fluid p-4 animate-fade-in" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="fw-bold mb-1">Support Tickets</h1>
          <p className="text-muted small mb-0">View, search, and manage your IT support tickets</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button onClick={fetchTickets} className="btn btn-outline-secondary d-flex align-items-center justify-content-center p-2 rounded-3 border-0 bg-light">
            <RefreshCw size={16} />
          </button>
          <Link to="/create-ticket" className="btn btn-primary d-flex align-items-center gap-2 rounded-3 py-2 px-3 border-0" style={{ backgroundColor: 'var(--primary-color)' }}>
            <Plus size={16} />
            <span>Create Ticket</span>
          </Link>
        </div>
      </div>

      <div className="card glass-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-muted"><Search size={16} /></span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search ticket title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING">Pending</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="ALL">All Categories</option>
              <option value="SOFTWARE">Software</option>
              <option value="HARDWARE">Hardware</option>
              <option value="NETWORK">Network</option>
              <option value="SECURITY">Security</option>
              <option value="DATABASE">Database</option>
              <option value="EMAIL">Email</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card glass-card p-4">
        {loading ? <TableSkeleton rows={8} /> : <TicketTable tickets={tickets} />}
      </div>
    </div>
  );
};

export default TicketList;
