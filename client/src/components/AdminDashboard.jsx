import React, { useState, useEffect, useCallback } from 'react';
import './AdminDashboard.css';
import AdminUsers from './AdminUsers';
import AdminBooks from './AdminBooks';
import AdminCoupons from './AdminCoupons';
import AdminOrders from './AdminOrders';

const AdminDashboard = ({ onBack, initialTab = 'dashboard', onViewBook }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('bookshareUser') 
        ? JSON.parse(localStorage.getItem('bookshareUser')).token 
        : null;
      
      if (!token) {
        setError('Unauthorized - No token');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          console.log('Not authorized as admin');
          onBack?.();
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch stats: ${response.status}`);
      }

      const data = await response.json();
      setStats(data.stats);
      setError('');
      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError(err.message || 'Error loading dashboard stats');
      setLoading(false);
    }
  }, [onBack]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (loading) {
    return <div className="admin-loading">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="admin-error-container" style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Error Loading Dashboard</h2>
        <p style={{ color: '#dc2626', marginTop: '10px', marginBottom: '20px' }}>
          {error}
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          Make sure the backend server is running on port 5000
        </p>
        <button
          onClick={fetchDashboardStats}
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        {/* Sidebar Navigation */}
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <h2>Admin Panel</h2>
          </div>
          <button
            onClick={() => onBack?.()}
            className="back-button"
            style={{
              padding: '12px 15px',
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              cursor: 'pointer',
              marginLeft: '10px',
              marginRight: '10px',
              marginBottom: '10px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'left'
            }}
          >
            ← Back to Profile
          </button>
          <nav className="sidebar-nav">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              style={{
                background: activeTab === 'dashboard' ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderLeft: activeTab === 'dashboard' ? '3px solid white' : 'none'
              }}
            >
              <i className="icon">📊</i>
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              style={{
                background: activeTab === 'users' ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderLeft: activeTab === 'users' ? '3px solid white' : 'none'
              }}
            >
              <i className="icon">👥</i>
              <span>Users</span>
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`nav-item ${activeTab === 'books' ? 'active' : ''}`}
              style={{
                background: activeTab === 'books' ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderLeft: activeTab === 'books' ? '3px solid white' : 'none'
              }}
            >
              <i className="icon">📚</i>
              <span>Books</span>
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`nav-item ${activeTab === 'coupons' ? 'active' : ''}`}
              style={{
                background: activeTab === 'coupons' ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderLeft: activeTab === 'coupons' ? '3px solid white' : 'none'
              }}
            >
              <i className="icon">🎫</i>
              <span>Coupons</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              style={{
                background: activeTab === 'orders' ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderLeft: activeTab === 'orders' ? '3px solid white' : 'none'
              }}
            >
              <i className="icon">📦</i>
              <span>Orders</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <div className="admin-content">
            {activeTab === 'dashboard' && (
              <div className="dashboard-overview">
                <h1>Welcome to Admin Dashboard</h1>

                {/* Stats Grid */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                      <h3>Total Users</h3>
                      <p className="stat-number">{stats?.totalUsers || 0}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                      <h3>Active Users</h3>
                      <p className="stat-number">{stats?.activeUsers || 0}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">🚫</div>
                    <div className="stat-info">
                      <h3>Disabled Users</h3>
                      <p className="stat-number">{stats?.disabledUsers || 0}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-info">
                      <h3>Total Books</h3>
                      <p className="stat-number">{stats?.totalBooks || 0}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                      <h3>Total Orders</h3>
                      <p className="stat-number">{stats?.totalOrders || 0}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                      <h3>Total Revenue</h3>
                      <p className="stat-number">Rs. {(stats?.totalRevenue || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                  <h2>Quick Actions</h2>
                  <div className="action-buttons">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="action-btn"
                    >
                      View & Manage Users
                    </button>
                    <button
                      onClick={() => setActiveTab('books')}
                      className="action-btn"
                    >
                      View & Manage Books
                    </button>
                    <button
                      onClick={() => setActiveTab('coupons')}
                      className="action-btn"
                    >
                      Create & Manage Coupons
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="action-btn"
                    >
                      Review All Orders
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'users' && <AdminUsers />}
            {activeTab === 'books' && <AdminBooks onViewBook={onViewBook} />}
            {activeTab === 'coupons' && <AdminCoupons />}
            {activeTab === 'orders' && <AdminOrders />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
