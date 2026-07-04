import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, ExternalLink } from 'lucide-react';

const TicketTable = ({ tickets }) => {
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-danger text-white';
      case 'HIGH': return 'bg-warning text-dark';
      case 'MEDIUM': return 'bg-primary text-white';
      case 'LOW': return 'bg-success text-white';
      default: return 'bg-secondary';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return 'border border-primary text-primary';
      case 'ASSIGNED': return 'border border-info text-info';
      case 'IN_PROGRESS': return 'bg-info text-white';
      case 'PENDING': return 'bg-warning text-dark';
      case 'RESOLVED': return 'bg-success text-white';
      case 'CLOSED': return 'bg-secondary text-white';
      case 'REJECTED': return 'bg-danger text-white';
      default: return 'bg-secondary';
    }
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';
    
    if (typeof aVal === 'string') {
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    } else {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedTickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tickets.length / itemsPerPage);

  return (
    <div>
      <div className="table-responsive">
        <table className="table table-hover align-middle border-0">
          <thead>
            <tr className="border-bottom">
              <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }} className="py-3 text-dark">
                ID <ArrowUpDown size={12} className="ms-1 text-muted" />
              </th>
              <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }} className="py-3 text-dark">
                Title <ArrowUpDown size={12} className="ms-1 text-muted" />
              </th>
              <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }} className="py-3 text-dark">
                Category <ArrowUpDown size={12} className="ms-1 text-muted" />
              </th>
              <th onClick={() => handleSort('priority')} style={{ cursor: 'pointer' }} className="py-3 text-dark">
                Priority <ArrowUpDown size={12} className="ms-1 text-muted" />
              </th>
              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }} className="py-3 text-dark">
                Status <ArrowUpDown size={12} className="ms-1 text-muted" />
              </th>
              <th onClick={() => handleSort('createdByFullName')} style={{ cursor: 'pointer' }} className="py-3 text-dark">
                Created By <ArrowUpDown size={12} className="ms-1 text-muted" />
              </th>
              <th onClick={() => handleSort('assignedToFullName')} style={{ cursor: 'pointer' }} className="py-3 text-dark">
                Assignee <ArrowUpDown size={12} className="ms-1 text-muted" />
              </th>
              <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }} className="py-3 text-end text-dark">
                Date <ArrowUpDown size={12} className="ms-1 text-muted" />
              </th>
              <th className="py-3 text-center text-dark">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-5 text-muted">No tickets found matching the filters.</td>
              </tr>
            ) : (
              currentItems.map((ticket) => (
                <tr key={ticket.id} className="border-bottom">
                  <td className="fw-semibold">#{ticket.id}</td>
                  <td>
                    <div className="fw-medium text-truncate" style={{ maxWidth: '200px' }} title={ticket.title}>
                      {ticket.title}
                    </div>
                  </td>
                  <td><span className="badge bg-light text-dark">{ticket.category}</span></td>
                  <td><span className={`badge ${getPriorityBadge(ticket.priority)}`}>{ticket.priority}</span></td>
                  <td><span className={`badge ${getStatusBadge(ticket.status)}`}>{ticket.status}</span></td>
                  <td>{ticket.createdByFullName}</td>
                  <td>
                    {ticket.assignedToFullName ? (
                      <span className="text-success fw-medium">{ticket.assignedToFullName}</span>
                    ) : (
                      <span className="text-muted italic">Unassigned</span>
                    )}
                  </td>
                  <td className="text-end text-muted" style={{ fontSize: '0.85rem' }}>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="text-center">
                    <Link to={`/tickets/${ticket.id}`} className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 border-0">
                      <ExternalLink size={14} />
                      <span>Details</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex align-items-center justify-content-between mt-3 px-2">
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, tickets.length)} of {tickets.length} tickets
          </span>
          <nav>
            <ul className="pagination pagination-sm mb-0 gap-1">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link rounded border-0 bg-light text-dark" onClick={() => setCurrentPage(c => Math.max(1, c - 1))}>Previous</button>
              </li>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <li key={idx} className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}>
                  <button className="page-link rounded border-0" onClick={() => setCurrentPage(idx + 1)}>{idx + 1}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link rounded border-0 bg-light text-dark" onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}>Next</button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default TicketTable;
