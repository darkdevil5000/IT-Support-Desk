import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Ticket, 
  FilePlus, 
  Users, 
  FileText, 
  User, 
  LogOut,
  HelpCircle
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const role = user.role;

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ROLE_ADMIN', 'ROLE_SUPPORT', 'ROLE_EMPLOYEE'] },
    { to: '/tickets', label: 'Tickets', icon: Ticket, roles: ['ROLE_ADMIN', 'ROLE_SUPPORT', 'ROLE_EMPLOYEE'] },
    { to: '/create-ticket', label: 'New Ticket', icon: FilePlus, roles: ['ROLE_ADMIN', 'ROLE_SUPPORT', 'ROLE_EMPLOYEE'] },
    { to: '/users', label: 'Manage Users', icon: Users, roles: ['ROLE_ADMIN'] },
    { to: '/reports', label: 'Reports', icon: FileText, roles: ['ROLE_ADMIN', 'ROLE_SUPPORT'] },
    { to: '/profile', label: 'Profile', icon: User, roles: ['ROLE_ADMIN', 'ROLE_SUPPORT', 'ROLE_EMPLOYEE'] },
  ];

  return (
    <div className="sidebar p-3 d-flex flex-column justify-content-between">
      <div>
        <div className="d-flex align-items-center gap-2 mb-4 px-2">
          <HelpCircle size={28} className="text-primary" />
          <span className="fs-5 fw-bold tracking-tight">IT Support Hub</span>
        </div>
        <ul className="nav nav-pills flex-column mb-auto gap-1">
          {links
            .filter((link) => link.roles.includes(role))
            .map((link) => (
              <li key={link.to} className="nav-item">
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center gap-3 px-3 py-2.5 rounded-lg text-decoration-none transition-all ${
                      isActive 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-secondary hover-bg-light'
                    }`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-color)',
                  })}
                >
                  <link.icon size={18} />
                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
        </ul>
      </div>

      <div className="border-top pt-3">
        <div className="d-flex align-items-center justify-content-between px-2 mb-3">
          <div className="d-flex flex-column">
            <span className="fw-semibold text-truncate" style={{ maxWidth: '140px' }}>{user.fullName}</span>
            <span className="text-muted text-xs text-uppercase" style={{ fontSize: '0.75rem' }}>
              {role.replace('ROLE_', '')}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
