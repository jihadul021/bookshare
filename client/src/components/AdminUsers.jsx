import React, { useState, useEffect, useCallback } from 'react';
import {
  getMessages,
  getOrCreateConversation,
  markConversationAsRead,
  sendMessage
} from '../api';
import './AdminUsers.css';
import { buildApiUrl, getApiErrorMessage } from '../utils/apiUrl';

const getAuthToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('bookshareUser') || '{}');
    return user.token || null;
  } catch {
    return null;
  }
};

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('bookshareUser') || 'null');
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
  const [chatOpen, setChatOpen] = useState(false);
  const [chatConversation, setChatConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const currentUser = getCurrentUser();

  const resetChatState = useCallback(() => {
    setChatOpen(false);
    setChatConversation(null);
    setChatMessages([]);
    setChatMessage('');
    setChatLoading(false);
    setChatSending(false);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      let url = buildApiUrl(`/api/admin/users?page=${page}&limit=10`);
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

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to fetch users'));
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error loading users');
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleViewProfile = async (userId) => {
    try {
      resetChatState();
      const token = getAuthToken();
      const response = await fetch(buildApiUrl(`/api/admin/users/${userId}`), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to fetch user details'));
      }

      const data = await response.json();
      setSelectedUser(data);
    } catch (err) {
      setError(err.message || 'Error loading user details');
    }
  };

  const initializeUserChat = useCallback(async (targetUser) => {
    if (!targetUser?._id) {
      return;
    }

    try {
      setChatOpen(true);
      setChatLoading(true);
      setError('');

      const conversationResponse = await getOrCreateConversation(targetUser._id);
      const nextConversation = conversationResponse.data.conversation;
      setChatConversation(nextConversation);

      const messagesResponse = await getMessages(nextConversation._id);
      setChatMessages(messagesResponse.data.messages || []);
      await markConversationAsRead(nextConversation._id);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error opening chat');
    } finally {
      setChatLoading(false);
    }
  }, []);

  const handleOpenUserChat = async (user) => {
    if (!user?._id) {
      return;
    }

    if (!selectedUser || selectedUser.user?._id !== user._id) {
      await handleViewProfile(user._id);
    }

    await initializeUserChat(user);
  };

  const handleAdminSendMessage = async (event) => {
    event.preventDefault();

    if (!selectedUser?.user?._id || !chatConversation?._id || !chatMessage.trim() || chatSending) {
      return;
    }

    try {
      setChatSending(true);
      setError('');

      const trimmedMessage = chatMessage.trim();
      const response = await sendMessage(chatConversation._id, selectedUser.user._id, trimmedMessage);
      const newMessage = response.data.message;

      setChatMessages((prev) => {
        if (prev.some((message) => message._id === newMessage._id)) {
          return prev;
        }

        return [...prev, newMessage];
      });
      setChatMessage('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error sending message');
    } finally {
      setChatSending(false);
    }
  };

  const handleBackToUsers = () => {
    resetChatState();
    setSelectedUser(null);
  };

  const handleDisableUser = async (userId) => {
    if (confirm('Are you sure you want to disable this account? All their books, orders, and pending orders will be cancelled.')) {
      try {
        const token = getAuthToken();
        const response = await fetch(buildApiUrl(`/api/admin/users/${userId}/disable`), {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(await getApiErrorMessage(response, 'Failed to disable user'));
        }

        // Refresh users list
        fetchUsers();
        if (selectedUser?.user?._id === userId) {
          handleViewProfile(userId);
        }
      } catch (err) {
        setError(err.message || 'Error disabling user');
      }
    }
  };

  const handleEnableUser = async (userId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(buildApiUrl(`/api/admin/users/${userId}/enable`), {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to enable user'));
      }

      // Refresh users list
      fetchUsers();
      if (selectedUser?.user?._id === userId) {
        handleViewProfile(userId);
      }
    } catch (err) {
      setError(err.message || 'Error enabling user');
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
          <button className="secondary-action-btn" onClick={handleBackToUsers}>
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
            <button
              className="btn-message-action"
              onClick={() => handleOpenUserChat(selectedUser.user)}
            >
              {chatOpen ? 'Refresh Chat' : 'Send Message'}
            </button>
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

          <section className="detail-card chat-detail-card">
            <div className="chat-card-header">
              <div>
                <h3>Direct Message</h3>
                <p className="chat-card-subtitle">
                  Send a message to this user from the admin panel.
                </p>
              </div>
              {!chatOpen && (
                <button
                  className="secondary-action-btn"
                  onClick={() => handleOpenUserChat(selectedUser.user)}
                >
                  Open Chat
                </button>
              )}
            </div>

            {!chatOpen ? (
              <p className="empty-copy">Open chat to start messaging this user.</p>
            ) : (
              <>
                <div className="admin-chat-thread">
                  {chatLoading ? (
                    <p className="empty-copy">Loading messages...</p>
                  ) : chatMessages.length === 0 ? (
                    <p className="empty-copy">No messages yet. Start the conversation below.</p>
                  ) : (
                    chatMessages.map((message) => {
                      const isCurrentAdmin = message.sender?._id === currentUser?._id;

                      return (
                        <div
                          key={message._id}
                          className={`admin-chat-message ${isCurrentAdmin ? 'sent' : 'received'}`}
                        >
                          <div className="admin-chat-bubble">
                            <span className="admin-chat-author">
                              {isCurrentAdmin ? 'You' : message.sender?.name || selectedUser.user.name}
                            </span>
                            {message.text && <p>{message.text}</p>}
                            <span className="admin-chat-time">
                              {new Date(message.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form className="admin-chat-form" onSubmit={handleAdminSendMessage}>
                  <textarea
                    value={chatMessage}
                    onChange={(event) => setChatMessage(event.target.value)}
                    placeholder={`Write a message to ${selectedUser.user.name}...`}
                    rows={4}
                    disabled={chatLoading || chatSending}
                  />
                  <button
                    type="submit"
                    className="btn-message-action"
                    disabled={chatLoading || chatSending || !chatMessage.trim()}
                  >
                    {chatSending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </>
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
                  <button
                    className="btn-message"
                    onClick={() => handleOpenUserChat(user)}
                    title="Send message"
                  >
                    Message
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
