import React, { useEffect, useRef, useState } from 'react';
import {
  deleteMessage,
  getMessages,
  getOrCreateConversation,
  markConversationAsRead,
  sendMessage
} from '../api';
import { connectSocket, getSocket } from '../socket';
import './FloatingChat.css';

const FloatingChat = ({ sellerId, sellerName, token, onClose, bookId = null }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('bookshareUser') || 'null');

  useEffect(() => {
    if (sellerId && token) {
      initializeChat();
    }
  }, [sellerId, token, bookId]);

  useEffect(() => {
    if (!token || !conversation?._id || !currentUser?._id) {
      return undefined;
    }

    const socket = connectSocket(currentUser._id) || getSocket();
    if (!socket) {
      return undefined;
    }

    const handleReceiveMessage = async (data) => {
      if (data.conversationId !== conversation._id) {
        return;
      }

      setMessages((prev) => {
        if (prev.some((message) => message._id === data.message._id)) {
          return prev;
        }
        return [...prev, data.message];
      });
      setTyping(false);
      await markConversationAsRead(conversation._id);
      socket.emit('mark-read', {
        conversationId: conversation._id,
        senderId: sellerId
      });
    };

    const handleMessageSent = (data) => {
      if (data.conversationId !== conversation._id) {
        return;
      }

      setMessages((prev) => {
        if (prev.some((message) => message._id === data.message._id)) {
          return prev;
        }
        return [...prev, data.message];
      });
    };

    const handleUserTyping = (data) => {
      if (data.conversationId === conversation._id) {
        setTyping(true);
      }
    };

    const handleUserStopTyping = (data) => {
      if (data.conversationId === conversation._id) {
        setTyping(false);
      }
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('message-sent', handleMessageSent);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-stop-typing', handleUserStopTyping);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('message-sent', handleMessageSent);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stop-typing', handleUserStopTyping);
    };
  }, [conversation?._id, token, sellerId, currentUser?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      const response = await getOrCreateConversation(sellerId, bookId);
      const nextConversation = response.data.conversation;
      setConversation(nextConversation);

      const messagesResponse = await getMessages(nextConversation._id);
      setMessages(messagesResponse.data.messages || []);
      await markConversationAsRead(nextConversation._id);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const emitTypingState = (isTyping) => {
    const socket = getSocket();
    if (!socket || !conversation?._id || !currentUser?._id) {
      return;
    }

    socket.emit(isTyping ? 'typing' : 'stop-typing', {
      conversationId: conversation._id,
      userId: currentUser._id,
      receiverId: sellerId
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

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!inputValue.trim() || !conversation || sending) {
      return;
    }

    const messageText = inputValue.trim();
    setInputValue('');
    setSending(true);
    emitTypingState(false);

    try {
      const response = await sendMessage(conversation._id, sellerId, messageText);
      const newMessage = response.data.message;

      setMessages((prev) => {
        if (prev.some((message) => message._id === newMessage._id)) {
          return prev;
        }
        return [...prev, newMessage];
      });

      const socket = getSocket();
      socket?.emit('send-message', {
        conversationId: conversation._id,
        senderId: currentUser._id,
        receiverId: sellerId,
        text: messageText,
        message: newMessage
      });
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
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  return (
    <div className={`floating-chat ${isMinimized ? 'minimized' : ''}`}>
      <div className="floating-chat-header">
        <div className="floating-chat-title">
          <h4>{sellerName}</h4>
          <span className="chat-status">{typing ? 'Typing...' : 'Online'}</span>
        </div>
        <div className="floating-chat-actions">
          <button
            className="chat-action-btn"
            onClick={() => setIsMinimized((prev) => !prev)}
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button
            className="chat-action-btn close-btn"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="floating-chat-messages">
            {loading ? (
              <div className="chat-loading">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="chat-empty">
                <p>Start a conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isSender = message.sender._id === currentUser?._id;

                return (
                  <div
                    key={message._id}
                    className={`chat-message ${isSender ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p className="message-text">
                        {message.isDeleted ? '[Message deleted]' : message.text}
                      </p>
                      <span className="message-time">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {isSender && !message.isDeleted && (
                      <button
                        className="delete-message-btn"
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
              <div className="floating-typing-indicator">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="floating-chat-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              onChange={handleInputChange}
              disabled={loading || sending}
            />
            <button type="submit" disabled={loading || sending || !inputValue.trim()}>
              {sending ? '...' : 'Send'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default FloatingChat;
