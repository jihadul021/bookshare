require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const protect = require('./middleware/authMiddleware');

const bookRoutes = require('./routes/bookRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const messageRoutes = require('./routes/messageRoutes');
const addressRoutes = require('./routes/addressRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');


dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: [process.env.CLIENT_URL, 'https://booksharenet.vercel.app'] }));
// Increase JSON payload limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => {
  res.send('API working!');
});

app.get('/api/test-auth', protect, (req, res) => {
  res.json({ message: 'Protected route works!', user: req.user });
});

const onlineUsers = new Set();

const getSocketUserId = (payload) => {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;
  if (typeof payload === 'object') return payload.userId || payload._id || null;
  return null;
};

// Socket.IO real-time chat
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('user-join', (payload) => {
    const userId = getSocketUserId(payload);
    if (!userId) {
      return;
    }

    socket.data.userId = userId;
    socket.join(`user:${userId}`);
    onlineUsers.add(userId);
    console.log(`User ${userId} joined with socket ${socket.id}`);
    io.emit('users-online', Array.from(onlineUsers));
  });

  // New message event
  socket.on('send-message', (data) => {
    const { conversationId, senderId, receiverId, text, message } = data;
    
    console.log(`Message from ${senderId} to ${receiverId} in conversation ${conversationId}`);
    
    io.to(`user:${receiverId}`).emit('receive-message', {
      conversationId,
      senderId,
      message
    });

    io.to(`user:${senderId}`).emit('message-sent', {
      conversationId,
      message
    });
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { conversationId, userId, receiverId } = data;
    if (receiverId) {
      io.to(`user:${receiverId}`).emit('user-typing', {
        conversationId,
        userId
      });
    }
  });

  // Stop typing
  socket.on('stop-typing', (data) => {
    const { conversationId, userId, receiverId } = data;
    if (receiverId) {
      io.to(`user:${receiverId}`).emit('user-stop-typing', {
        conversationId,
        userId
      });
    }
  });

  // Mark message as read
  socket.on('mark-read', (data) => {
    const { conversationId, senderId } = data;
    if (senderId) {
      io.to(`user:${senderId}`).emit('message-read', {
        conversationId
      });
    }
  });

  socket.on('disconnect', () => {
    const userId = socket.data.userId;
    if (userId) {
      const room = io.sockets.adapter.rooms.get(`user:${userId}`);
      if (!room || room.size === 0) {
        onlineUsers.delete(userId);
        io.emit('users-online', Array.from(onlineUsers));
      }
      console.log(`User ${userId} disconnected`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
