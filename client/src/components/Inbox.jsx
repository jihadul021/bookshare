import React, { useState, useEffect } from 'react';
import { deleteConversation, getConversations, searchConversations } from '../api';
import { connectSocket, getSocket } from '../socket';
import getImageUrl from '../utils/getImageUrl';
import './Inbox.css';

const Inbox = ({ onSelectConversation, onBack, token }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);

  useEffect(() => {
    fetchConversations();
  }, [token]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const currentUser = JSON.parse(localStorage.getItem('bookshareUser') || 'null');
    if (!currentUser?._id) {
      return undefined;
    }

    const socket = connectSocket(currentUser._id) || getSocket();
    if (!socket) {
      return undefined;
    }

    const handleRefresh = () => {
      fetchConversations();
    };

    socket.on('receive-message', handleRefresh);
    socket.on('message-sent', handleRefresh);
    socket.on('message-read', handleRefresh);

    return () => {
      socket.off('receive-message', handleRefresh);
      socket.off('message-sent', handleRefresh);
      socket.off('message-read', handleRefresh);
    };
  }, [token]);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchQuery]);

  useEffect(() => {
    const handleChatUpdated = () => {
      fetchConversations();
    };

    window.addEventListener('bookshare-chat-updated', handleChatUpdated);
    return () => window.removeEventListener('bookshare-chat-updated', handleChatUpdated);
  }, [token]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await getConversations();
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterConversations = () => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const filtered = conversations.filter(conv => {
      const participant = conv.participants.find(p => p._id !== JSON.parse(localStorage.getItem('bookshareUser'))?._id);
      return participant?.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
    setFilteredConversations(filtered);
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const response = await searchConversations(query);
        setFilteredConversations(response.data.conversations);
      } catch (error) {
        console.error('Search failed:', error);
      }
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    const confirmed = window.confirm('Delete this conversation from your inbox?');
    if (!confirmed) {
      return;
    }

    try {
      await deleteConversation(conversationId);
      setConversations((prev) => prev.filter((conversation) => conversation._id !== conversationId));
      setFilteredConversations((prev) => prev.filter((conversation) => conversation._id !== conversationId));
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const currentUser = JSON.parse(localStorage.getItem('bookshareUser'));

  return (
    <div className="inbox-container">
      <div className="inbox-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h1>Messages</h1>
      </div>

      <div className="inbox-search">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="inbox-list">
        {loading ? (
          <div className="loading">Loading conversations...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="empty">
            <p>No conversations yet</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherParticipant = conversation.participants.find(
              p => p._id !== currentUser._id
            );
            const unreadCount = conversation.unreadCount?.[currentUser._id] || 0;
            const isUnread = unreadCount > 0;

            return (
              <div
                key={conversation._id}
                className={`inbox-item ${isUnread ? 'unread' : ''}`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="participant-avatar">
                  {otherParticipant?.profilePicture ? (
                    <img src={getImageUrl(otherParticipant.profilePicture)} alt={otherParticipant.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {otherParticipant?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="inbox-item-content">
                  <div className="inbox-item-header">
                    <h3>{otherParticipant?.name}</h3>
                    <span className="timestamp">
                      {new Date(conversation.lastMessageAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="last-message">
                    {conversation.lastMessage ? (
                      <>
                        <span className="sender">
                          {conversation.lastMessageSender._id === currentUser._id ? 'You: ' : ''}
                        </span>
                        {conversation.lastMessageText}
                      </>
                    ) : (
                      'No messages yet'
                    )}
                  </p>
                </div>

                <div className="inbox-item-actions">
                  {isUnread && <div className="unread-badge">{unreadCount}</div>}
                  <button
                    className="delete-conversation-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteConversation(conversation._id);
                    }}
                    title="Delete conversation"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button className="refresh-btn" onClick={fetchConversations}>
        ↻ Refresh
      </button>
    </div>
  );
};

export default Inbox;
