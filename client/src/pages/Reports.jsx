import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { 
  FileSpreadsheet, 
  FileText, 
  FileDown, 
  ShieldCheck, 
  Clock, 
  Info,
  Network
} from 'lucide-react';

const Reports = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState({ pdf: false, excel: false });
  
  // Date filters states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAuditLogs = async () => {
    if (user?.role !== 'ROLE_ADMIN') return;
    setLoading(true);
    try {
      const res = await axios.get('/reports/audit-logs', {
        params: { startDate, endDate }
      });
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [user, startDate, endDate]);

  const handleDownload = async (format) => {
    setDownloading(prev => ({ ...prev, [format]: true }));
    try {
      const endpoint = format === 'pdf' ? 'pdf' : 'excel';
      const res = await axios.get(`/reports/export/${endpoint}`, {
        params: { startDate, endDate },
        responseType: 'blob'
      });
      const blob = new Blob([res.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `tickets_report_${startDate || 'all'}_to_${endDate || 'all'}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Failed to generate download report.');
    } finally {
      setDownloading(prev => ({ ...prev, [format]: false }));
    }
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <div className="container-fluid p-4 animate-fade-in" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-primary text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px', backgroundColor: 'var(--primary-color)' }}>
          <FileDown size={24} />
        </div>
        <div>
          <h1 className="fw-bold mb-1">Reports & Auditing</h1>
          <p className="text-muted small mb-0">Export spreadsheet logs and inspect security audit trails</p>
        </div>
      </div>

      {/* Date Filter Panel */}
      <div className="card glass-card p-4 mb-4">
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
          <Clock size={20} className="text-primary" />
          <span>Report & Audit Date Range Filter</span>
        </h5>
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <label className="form-label small fw-semibold text-muted mb-1">Start Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-md-5">
            <label className="form-label small fw-semibold text-muted mb-1">End Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="col-md-2 d-flex align-items-end" style={{ height: '58px' }}>
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }} 
              disabled={!startDate && !endDate}
              className="btn btn-outline-secondary w-100 border-0"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card glass-card p-4 d-flex flex-row align-items-center gap-3">
            <div className="bg-success text-white p-3 rounded-4">
              <FileSpreadsheet size={32} />
            </div>
            <div>
              <h5 className="fw-bold mb-1">Export to Microsoft Excel</h5>
              <p className="text-muted small">Generates an .xlsx spreadsheet of all tickets in the system.</p>
              <button 
                onClick={() => handleDownload('excel')} 
                disabled={downloading.excel}
                className="btn btn-outline-success btn-sm mt-1 d-inline-flex align-items-center gap-1 border-0"
              >
                {downloading.excel ? 'Generating...' : 'Download Spreadsheet'}
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card glass-card p-4 d-flex flex-row align-items-center gap-3">
            <div className="bg-danger text-white p-3 rounded-4">
              <FileText size={32} />
            </div>
            <div>
              <h5 className="fw-bold mb-1">Export to PDF Format</h5>
              <p className="text-muted small">Generates a formatted PDF report suitable for printing.</p>
              <button 
                onClick={() => handleDownload('pdf')} 
                disabled={downloading.pdf}
                className="btn btn-outline-danger btn-sm mt-1 d-inline-flex align-items-center gap-1 border-0"
              >
                {downloading.pdf ? 'Generating...' : 'Download PDF Document'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="card glass-card p-4">
          <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-dark">
            <ShieldCheck size={20} className="text-success" />
            <span>IT Support Security Audit Logs</span>
          </h5>

          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : (
            <div className="table-responsive" style={{ maxHeight: '400px' }}>
              <table className="table table-hover align-middle border-0">
                <thead>
                  <tr className="border-bottom">
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Log Details</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">No security logs recorded for the selected date range.</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="border-bottom" style={{ fontSize: '0.85rem' }}>
                        <td className="text-muted d-flex align-items-center gap-1 py-3">
                          <Clock size={12} />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </td>
                        <td className="fw-semibold text-dark">{log.user ? log.user.fullName : 'System'}</td>
                        <td>
                          <span className={`badge ${
                            log.action.includes('SUCCESS') || log.action === 'REGISTER' || log.action === 'LOGIN' ? 'bg-light text-success' : 'bg-light text-dark'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <span className="text-dark d-flex align-items-center gap-1">
                            <Info size={12} className="text-muted" />
                            <span className="text-dark">{log.details}</span>
                          </span>
                        </td>
                        <td className="text-muted">
                          <span className="d-flex align-items-center gap-1">
                            <Network size={12} />
                            <span>{log.ipAddress}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
