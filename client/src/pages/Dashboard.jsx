import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StatsSkeleton } from '../components/LoadingSkeleton';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { 
  Ticket, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const textColor = theme === 'dark' ? '#f1f5f9' : '#1e293b';
  const textMuted = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await axios.get('/dashboard/stats');
        setStats(statsRes.data);
        
        // Fetch recent tickets
        const ticketsRes = await axios.get('/tickets');
        setRecentTickets(ticketsRes.data.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <h1 className="fw-bold mb-4">Dashboard</h1>
        <StatsSkeleton />
      </div>
    );
  }

  // Chart Data preparation
  const statusLabels = Object.keys(stats?.statusBreakdown || {});
  const statusValues = Object.values(stats?.statusBreakdown || {});
  const pieData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusValues,
        backgroundColor: [
          'rgba(79, 70, 229, 0.65)',  // OPEN (Indigo)
          'rgba(6, 182, 212, 0.65)',  // ASSIGNED (Cyan)
          'rgba(59, 130, 246, 0.65)', // IN_PROGRESS (Blue)
          'rgba(245, 158, 11, 0.65)', // PENDING (Amber)
          'rgba(16, 185, 129, 0.65)', // RESOLVED (Emerald)
          'rgba(107, 114, 128, 0.65)',// CLOSED (Gray)
          'rgba(239, 68, 68, 0.65)'   // REJECTED (Red)
        ],
        borderWidth: 1,
      },
    ],
  };

  const priorityLabels = Object.keys(stats?.priorityBreakdown || {});
  const priorityValues = Object.values(stats?.priorityBreakdown || {});
  const barData = {
    labels: priorityLabels,
    datasets: [
      {
        label: 'Tickets by Priority',
        data: priorityValues,
        backgroundColor: [
          'rgba(16, 185, 129, 0.65)', // LOW (Green)
          'rgba(59, 130, 246, 0.65)', // MEDIUM (Blue)
          'rgba(245, 158, 11, 0.65)', // HIGH (Orange)
          'rgba(239, 68, 68, 0.65)'   // CRITICAL (Red)
        ],
        borderWidth: 1,
      },
    ],
  };

  const categoryLabels = Object.keys(stats?.categoryBreakdown || {});
  const categoryValues = Object.values(stats?.categoryBreakdown || {});
  const lineData = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Tickets by Category',
        data: categoryValues,
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          font: { family: 'Inter', size: 11 }
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: textMuted } },
      y: { grid: { color: gridColor }, ticks: { color: textMuted } }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          font: { family: 'Inter', size: 11 }
        }
      }
    }
  };

  return (
    <div className="container-fluid p-4 animate-fade-in" style={{ backgroundColor: 'var(--bg-color)' }}>
      <h1 className="fw-bold mb-4">Analytics Dashboard</h1>

      {/* Counters Grid */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card glass-card p-3 d-flex flex-row align-items-center justify-content-between">
            <div>
              <span className="text-muted small fw-semibold text-uppercase">Total Tickets</span>
              <h2 className="fw-bold mb-0 mt-1">{stats?.totalTickets}</h2>
            </div>
            <div className="bg-primary text-white rounded-circle p-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary-color)' }}>
              <FileText size={20} />
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card glass-card p-3 d-flex flex-row align-items-center justify-content-between">
            <div>
              <span className="text-muted small fw-semibold text-uppercase">Open & Unassigned</span>
              <h2 className="fw-bold mb-0 mt-1">{stats?.openTickets}</h2>
            </div>
            <div className="bg-info text-white rounded-circle p-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
              <Clock size={20} />
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card glass-card p-3 d-flex flex-row align-items-center justify-content-between">
            <div>
              <span className="text-muted small fw-semibold text-uppercase">Resolved Tickets</span>
              <h2 className="fw-bold mb-0 mt-1">{stats?.resolvedTickets}</h2>
            </div>
            <div className="bg-success text-white rounded-circle p-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
              <CheckCircle size={20} />
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card glass-card p-3 d-flex flex-row align-items-center justify-content-between priority-CRITICAL">
            <div>
              <span className="text-muted small fw-semibold text-uppercase">Critical Issues</span>
              <h2 className="fw-bold mb-0 mt-1 text-danger">{stats?.criticalTickets}</h2>
            </div>
            <div className="bg-danger text-white rounded-circle p-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card glass-card p-3 h-100">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Activity size={18} className="text-primary" />
              <span>Status distribution</span>
            </h5>
            <div className="d-flex align-items-center justify-content-center" style={{ height: '240px' }}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card glass-card p-3 h-100">
            <h5 className="fw-bold mb-3">Priority Metrics</h5>
            <div className="d-flex align-items-center justify-content-center" style={{ height: '240px' }}>
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card glass-card p-3 h-100">
            <h5 className="fw-bold mb-3">Category Breakdown</h5>
            <div className="d-flex align-items-center justify-content-center" style={{ height: '240px' }}>
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="row">
        <div className="col-md-12">
          <div className="card glass-card p-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Ticket size={18} className="text-primary" />
              <span>Recent Tickets Activity Feed</span>
            </h5>
            <div className="timeline">
              {recentTickets.length === 0 ? (
                <div className="text-muted text-center py-3">No ticket actions logged recently.</div>
              ) : (
                recentTickets.map((t) => (
                  <div key={t.id} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-1">
                      <div>
                        <Link to={`/tickets/${t.id}`} className="fw-semibold text-decoration-none text-dark" style={{ color: 'var(--text-color)' }}>
                          #{t.id} - {t.title}
                        </Link>
                        <p className="text-muted small mb-0">
                          Opened by <strong>{t.createdByFullName}</strong> ({t.createdByDepartment}) • Category: {t.category}
                        </p>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-light text-dark">{t.status}</span>
                        <span className={`badge ${t.priority === 'CRITICAL' ? 'bg-danger text-white' : 'bg-secondary'}`}>{t.priority}</span>
                      </div>
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

export default Dashboard;
