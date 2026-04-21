import React, { useEffect, useRef, useState } from 'react';
import {
  deleteConversation,
  deleteMessage,
  getConversations,
  getMessages,
  markConversationAsRead,
  sendMessage
} from '../api';
import { connectSocket, getSocket } from '../socket';
import getImageUrl from '../utils/getImageUrl';
import './ChatWindow.css';

const getCurrentUser = () => JSON.parse(localStorage.getItem('bookshareUser') || 'null');
const notifyChatUpdate = (conversationId) => {
  if (!conversationId) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent('bookshare-chat-updated', {
      detail: { conversationId }
    })
  );
};

const isConversationUnread = (conversation, userId) =>
  Number(conversation?.unreadCount?.[userId] || 0) > 0;

const ChatWindow = ({ conversation, onBack, token }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(conversation);
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const imageInputRef = useRef(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    setSelectedConversation(conversation);
  }, [conversation]);

  useEffect(() => {
    if (token) {
      loadConversations();
    }
  }, [token]);

  useEffect(() => {
    if (selectedConversation?._id) {
      loadMessages(selectedConversation._id);
    }
  }, [selectedConversation?._id]);

  useEffect(() => {
    const handleChatUpdated = async (event) => {
      const updatedConversationId = event.detail?.conversationId;
      await loadConversations();

      if (updatedConversationId && updatedConversationId === selectedConversation?._id) {
        await loadMessages(updatedConversationId, false);
      }
    };

    window.addEventListener('bookshare-chat-updated', handleChatUpdated);
    return () => window.removeEventListener('bookshare-chat-updated', handleChatUpdated);
  }, [selectedConversation?._id]);

  useEffect(() => {
    if (!token || !currentUser?._id) {
      return undefined;
    }

    const socket = connectSocket(currentUser._id) || getSocket();
    if (!socket) {
      return undefined;
    }

    const handleReceiveMessage = async (data) => {
      await loadConversations();

      if (data.conversationId === selectedConversation?._id) {
        setMessages((prev) => {
          if (prev.some((message) => message._id === data.message._id)) {
            return prev;
          }
          return [...prev, data.message];
        });
        notifyChatUpdate(selectedConversation._id);
        setTyping(false);
        await handleMarkConversationAsRead(selectedConversation);
      }
    };

    const handleMessageSent = async (data) => {
      await loadConversations();

      if (data.conversationId === selectedConversation?._id) {
        setMessages((prev) => {
          if (prev.some((message) => message._id === data.message._id)) {
            return prev;
          }
          return [...prev, data.message];
        });
        notifyChatUpdate(selectedConversation._id);
      }
    };

    const handleReadReceipt = async (data) => {
      if (data.conversationId === selectedConversation?._id) {
        await loadMessages(selectedConversation._id, false);
      }
      await loadConversations();
    };

    const handleUserTyping = (data) => {
      if (data.conversationId === selectedConversation?._id) {
        setTyping(true);
      }
    };

    const handleUserStopTyping = (data) => {
      if (data.conversationId === selectedConversation?._id) {
        setTyping(false);
      }
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('message-sent', handleMessageSent);
    socket.on('message-read', handleReadReceipt);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-stop-typing', handleUserStopTyping);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('message-sent', handleMessageSent);
      socket.off('message-read', handleReadReceipt);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stop-typing', handleUserStopTyping);
    };
  }, [token, selectedConversation?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const loadConversations = async () => {
    try {
      const response = await getConversations();
      const nextConversations = response.data.conversations || [];
      setConversations(nextConversations);

      if (selectedConversation?._id) {
        const refreshedSelectedConversation = nextConversations.find(
          (item) => item._id === selectedConversation._id
        );

        if (refreshedSelectedConversation) {
          setSelectedConversation(refreshedSelectedConversation);
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (conversationId, showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await getMessages(conversationId);
      setMessages(response.data.messages || []);
      await handleMarkConversationAsRead({ _id: conversationId, participants: selectedConversation?.participants || [] });
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const handleMarkConversationAsRead = async (targetConversation) => {
    if (!targetConversation?._id) {
      return;
    }

    try {
      await markConversationAsRead(targetConversation._id);
      await loadConversations();

      const otherParticipant = targetConversation.participants?.find(
        (participant) => participant._id !== currentUser?._id
      );

      const socket = getSocket();
      if (socket && otherParticipant?._id) {
        socket.emit('mark-read', {
          conversationId: targetConversation._id,
          senderId: otherParticipant._id
        });
      }
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
    }
  };

  const emitTypingState = (isTyping) => {
    const otherParticipant = selectedConversation?.participants?.find(
      (participant) => participant._id !== currentUser?._id
    );
    const socket = getSocket();

    if (!socket || !otherParticipant?._id || !selectedConversation?._id) {
      return;
    }

    socket.emit(isTyping ? 'typing' : 'stop-typing', {
      conversationId: selectedConversation._id,
      userId: currentUser._id,
      receiverId: otherParticipant._id
    });
  };

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    setInputValue(nextValue);

    if (!nextValue.trim()) {
      emitTypingState(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      return;
    }

    emitTypingState(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitTypingState(false);
    }, 1200);
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if ((!inputValue.trim() && !selectedImage) || !selectedConversation || sending) {
      return;
    }

    const recipient = selectedConversation.participants.find(
      (participant) => participant._id !== currentUser?._id
    );
    if (!recipient?._id) {
      return;
    }

    const messageText = inputValue.trim();
    setInputValue('');
    setSending(true);
    emitTypingState(false);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('conversationId', selectedConversation._id);
      formData.append('receiverId', recipient._id);
      if (messageText) {
        formData.append('text', messageText);
      }
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const newMessage = data.message;

      setMessages((prev) => {
        if (prev.some((message) => message._id === newMessage._id)) {
          return prev;
        }

        return [...prev, newMessage];
      });
      notifyChatUpdate(selectedConversation._id);

      const socket = getSocket();
      socket?.emit('send-message', {
        conversationId: selectedConversation._id,
        senderId: currentUser._id,
        receiverId: recipient._id,
        text: messageText,
        message: newMessage
      });

      clearImageSelection();
      await loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((message) =>
          message._id === messageId
            ? { ...message, text: '[Message deleted]', isDeleted: true }
            : message
        )
      );
      notifyChatUpdate(selectedConversation?._id);
      await loadConversations();
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleDeleteCurrentConversation = async () => {
    if (!selectedConversation?._id) {
      return;
    }

    const confirmed = window.confirm('Delete this conversation from your inbox?');
    if (!confirmed) {
      return;
    }

    try {
      await deleteConversation(selectedConversation._id);
      const remainingConversations = conversations.filter(
        (item) => item._id !== selectedConversation._id
      );
      setConversations(remainingConversations);
      setSelectedConversation(remainingConversations[0] || null);
      if (remainingConversations.length === 0) {
        onBack?.();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const otherParticipant = selectedConversation?.participants?.find(
    (participant) => participant._id !== currentUser?._id
  );

  return (
    <div className="chat-window-container">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Chats</h2>
          <button className="close-sidebar-btn" onClick={onBack}>✕</button>
        </div>

        <div className="conversations-list">
          {conversations.map((item) => {
            const participant = item.participants.find((user) => user._id !== currentUser?._id);
            const isSelected = item._id === selectedConversation?._id;
            const unread = isConversationUnread(item, currentUser?._id);

            return (
              <div
                key={item._id}
                className={`conversation-item ${isSelected ? 'selected' : ''} ${unread ? 'unread' : ''}`}
                onClick={() => setSelectedConversation(item)}
              >
                <div className="conv-avatar">
                  {participant?.profilePicture ? (
                    <img src={getImageUrl(participant.profilePicture)} alt={participant.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {participant?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="conv-info">
                  <h4>{participant?.name}</h4>
                  <p>{item.lastMessageText || 'No messages yet'}</p>
                </div>
                {unread && <span className="conversation-unread-dot" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="chat-main">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <h3>{otherParticipant?.name}</h3>
                <span className="status">{typing ? 'Typing...' : 'Online'}</span>
              </div>
              <div className="chat-header-actions">
                <button className="delete-conversation-header-btn" onClick={handleDeleteCurrentConversation}>
                  Delete Conversation
                </button>
                <button className="back-to-inbox" onClick={onBack}>← Back</button>
              </div>
            </div>

            <div className="chat-messages">
              {loading ? (
                <div className="loading">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="empty">
                  <p>Start a conversation</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isSender = message.sender._id === currentUser?._id;

                  return (
                    <div
                      key={message._id}
                      className={`message ${isSender ? 'sent' : 'received'}`}
                    >
                      {!isSender && (
                        <div className="message-avatar">
                          {message.sender?.profilePicture ? (
                            <img src={getImageUrl(message.sender.profilePicture)} alt={message.sender.name} />
                          ) : (
                            <div className="avatar-sm">
                              {message.sender?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="message-bubble">
                        {message.image && (
                          <img
                            src={getImageUrl(message.image)}
                            alt="Message"
                            style={{
                              maxWidth: '200px',
                              maxHeight: '200px',
                              borderRadius: '8px',
                              marginBottom: message.text ? '8px' : '0'
                            }}
                          />
                        )}
                        {message.text && (
                          <p className="message-text">
                            {message.isDeleted ? '[Message deleted]' : message.text}
                          </p>
                        )}
                        <div className="message-meta">
                          <span className="message-time">
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {isSender && message.isRead && (
                            <span className="read-status">✓✓</span>
                          )}
                        </div>
                      </div>

                      {isSender && !message.isDeleted && (
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteMessage(message._id)}
                          title="Delete message"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })
              )}

              {typing && (
                <div className="typing-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage}>
              {imagePreview && (
                <div style={{
                  padding: '8px',
                  borderBottom: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#f5f5f5'
                }}>
                  <img
                    src={imagePreview}
                    alt="Selected"
                    style={{
                      maxHeight: '40px',
                      maxWidth: '40px',
                      borderRadius: '4px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={clearImageSelection}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '0'
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputValue}
                  onChange={handleInputChange}
                  disabled={loading || sending}
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                  disabled={loading || sending}
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={loading || sending}
                  title="Attach image"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '0 8px',
                    color: selectedImage ? '#007bff' : '#999'
                  }}
                >
                  📎
                </button>
                <button
                  type="submit"
                  disabled={loading || sending || (!inputValue.trim() && !selectedImage)}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="no-conversation">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
