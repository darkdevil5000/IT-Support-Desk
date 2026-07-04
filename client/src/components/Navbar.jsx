import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Client } from '@stomp/stompjs';
import axios from 'axios';
import { 
  Bell, 
  Sun, 
  Moon, 
  Search, 
  User, 
  LogOut, 
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ onSearchChange }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data);
      const countRes = await axios.get('/notifications/unread-count');
      setUnreadCount(countRes.data.count);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
    const stompClient = new Client({
      brokerURL: wsUrl,
      onConnect: () => {
        stompClient.subscribe(`/topic/notifications/${user.id}`, (message) => {
          const text = message.body;
          setNotifications((prev) => [
            {
              id: Date.now(),
              message: text,
              isRead: false,
              createdAt: new Date().toISOString()
            },
            ...prev
          ]);
          setUnreadCount((c) => c + 1);
        });
      },
      reconnectDelay: 5000
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg glass-navbar sticky-top px-4 py-2 d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-2 w-50">
        {onSearchChange && (
          <div className="input-group input-group-sm w-50 border rounded-pill px-2 py-1 bg-light">
            <span className="input-group-text bg-transparent border-0 text-muted">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control bg-transparent border-0 text-dark shadow-none"
              placeholder="Search tickets..."
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="d-flex align-items-center gap-3">
        <button
          onClick={toggleTheme}
          className="btn btn-link text-decoration-none text-secondary p-2 rounded-circle hover-bg-light border-0"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-warning" />}
        </button>

        <div className="position-relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-link text-decoration-none text-secondary p-2 rounded-circle hover-bg-light position-relative border-0"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="position-absolute top-1 start-75 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="position-absolute end-0 mt-2 card glass-card p-3 animate-fade-in" style={{ width: '320px', zIndex: 1050 }}>
              <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
                <span className="fw-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllAsRead} className="btn btn-link btn-sm text-primary text-decoration-none p-0">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-auto" style={{ maxHeight: '250px' }}>
                {notifications.length === 0 ? (
                  <div className="text-center text-muted py-3">No new notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-2 rounded-3 mb-1 d-flex justify-content-between align-items-start gap-2 ${
                        notif.isRead ? 'opacity-75' : 'bg-light fw-medium border-start border-primary border-3'
                      }`}
                      style={{ fontSize: '0.85rem' }}
                    >
                      <span className="text-dark">{notif.message}</span>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="btn btn-link p-0 text-success border-0"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="position-relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="btn btn-link text-decoration-none text-secondary p-1 rounded-circle hover-bg-light border-0"
          >
            <div
              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-semibold shadow-sm"
              style={{ width: '36px', height: '36px' }}
            >
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
          </button>

          {showProfileMenu && (
            <div className="position-absolute end-0 mt-2 card glass-card p-2 animate-fade-in" style={{ width: '180px', zIndex: 1050 }}>
              <Link
                to="/profile"
                className="d-flex align-items-center gap-2 p-2 rounded text-decoration-none text-dark hover-bg-light"
                onClick={() => setShowProfileMenu(false)}
              >
                <User size={16} />
                <span>My Profile</span>
              </Link>
              <hr className="my-1 text-secondary" />
              <button
                onClick={logout}
                className="btn btn-link text-start text-danger d-flex align-items-center gap-2 p-2 w-100 text-decoration-none border-0"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
