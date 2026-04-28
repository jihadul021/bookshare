import React, { useState, useEffect, useCallback } from 'react';
import './AdminUsers.css';

const getAuthToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('bookshareUser') || '{}');
    return user.token || null;
  } catch {
    return null;
  }
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/admin/users?page=${page}&limit=10`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const token = getAuthToken();
      if (!token) throw new Error('No token found');
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch {
      setError('Error loading users');
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleViewProfile = async (userId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch user details');

      const data = await response.json();
      setSelectedUser(data);
    } catch {
      setError('Error loading user details');
    }
  };

  const handleDisableUser = async (userId) => {
    if (confirm('Are you sure you want to disable this account? All their books, orders, and pending orders will be cancelled.')) {
      try {
        const token = getAuthToken();
        const response = await fetch(`/api/admin/users/${userId}/disable`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to disable user');

        // Refresh users list
        fetchUsers();
        if (selectedUser?.user?._id === userId) {
          handleViewProfile(userId);
        }
      } catch {
      setError('Error disabling user');
      }
    }
  };

  const handleEnableUser = async (userId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/admin/users/${userId}/enable`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to enable user');

      // Refresh users list
      fetchUsers();
      if (selectedUser?.user?._id === userId) {
        handleViewProfile(userId);
      }
    } catch {
      setError('Error enabling user');
    }
  };

  if (loading && users.length === 0) {
    return <div className="users-loading">Loading users...</div>;
  }

  if (selectedUser) {
    return (
      <div className="admin-users admin-user-profile-view">
        <div className="management-header">
          <div>
            <h1>{selectedUser.user.name}</h1>
            <p className="management-subtitle">Complete account details, activity, and listed books.</p>
          </div>
          <button className="secondary-action-btn" onClick={() => setSelectedUser(null)}>
            ← Back to Users
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="profile-overview-card">
          <div className="profile-overview-main">
            <div className="profile-avatar">
              {selectedUser.user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2>{selectedUser.user.name}</h2>
              <p>{selectedUser.user.email}</p>
              <div className="profile-chip-row">
                <span className={`role-badge ${selectedUser.user.role}`}>{selectedUser.user.role}</span>
                <span className={`status-badge ${selectedUser.user.isDisabled ? 'disabled' : 'active'}`}>
                  {selectedUser.user.isDisabled ? 'Disabled' : 'Active'}
                </span>
              </div>
            </div>
          </div>
          <div className="profile-action-row">
            {selectedUser.user.role !== 'admin' && (
              <>
                {selectedUser.user.isDisabled ? (
                  <button
                    className="btn-enable-action"
                    onClick={() => handleEnableUser(selectedUser.user._id)}
                  >
                    Enable Account
                  </button>
                ) : (
                  <button
                    className="btn-disable-action"
                    onClick={() => handleDisableUser(selectedUser.user._id)}
                  >
                    Disable Account
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="detail-grid">
          <section className="detail-card">
            <h3>Personal Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>User ID</label>
                <span>{selectedUser.user._id}</span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span>{selectedUser.user.email}</span>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <span>{selectedUser.user.phone || '-'}</span>
              </div>
              <div className="info-item">
                <label>Gender</label>
                <span>{selectedUser.user.gender}</span>
              </div>
              <div className="info-item">
                <label>Address</label>
                <span>{selectedUser.user.address || '-'}</span>
              </div>
              <div className="info-item">
                <label>Joined</label>
                <span>{new Date(selectedUser.user.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </section>

          <section className="detail-card">
            <h3>Buying Orders</h3>
            {selectedUser.buyingOrders.length > 0 ? (
              <div className="stack-list">
                {selectedUser.buyingOrders.map((order) => (
                  <div key={order._id} className="stack-item">
                    <strong>{order.orderNumber}</strong>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-copy">No buying orders found.</p>
            )}
          </section>

          <section className="detail-card">
            <h3>Selling Orders</h3>
            {selectedUser.sellingOrders.length > 0 ? (
              <div className="stack-list">
                {selectedUser.sellingOrders.map((order) => (
                  <div key={order._id} className="stack-item">
                    <strong>{order.orderNumber}</strong>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-copy">No selling orders found.</p>
            )}
          </section>

          <section className="detail-card">
            <h3>Listed Books</h3>
            {selectedUser.userBooks?.length > 0 ? (
              <div className="stack-list">
                {selectedUser.userBooks.map((book) => (
                  <div key={book._id} className="stack-item">
                    <strong>{book.title}</strong>
                    <span>Tk {book.price}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-copy">No books listed yet.</p>
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="management-header">
        <div>
          <h1>User Management</h1>
          <p className="management-subtitle">Review accounts, open full user profiles, and control access.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="search-input"
        />
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="user-id-cell">{user._id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                </td>
                <td>
                  <span className={`status-badge ${user.isDisabled ? 'disabled' : 'active'}`}>
                    {user.isDisabled ? 'Disabled' : 'Active'}
                  </span>
                </td>
                <td>{new Date(user.joinDate).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() => handleViewProfile(user._id)}
                    title="View profile"
                  >
                    View
                  </button>
                  {user.role !== 'admin' && (
                    <>
                      {user.isDisabled ? (
                        <button
                          className="btn-enable"
                          onClick={() => handleEnableUser(user._id)}
                          title="Enable account"
                        >
                          Enable
                        </button>
                      ) : (
                        <button
                          className="btn-disable"
                          onClick={() => handleDisableUser(user._id)}
                          title="Disable account"
                        >
                          Disable
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="pagination-btn"
        >
          Previous
        </button>
        <span className="page-info">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminUsers;
