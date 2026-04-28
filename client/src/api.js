import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('bookshareUser');

  if (storedUser && !config.headers?.Authorization) {
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${parsedUser.token}`;
      }
    } catch (error) {
      console.error('Failed to parse stored user for API request:', error);
    }
  }

  return config;
});

// Auth endpoints
export const login = (email, password) => api.post('/api/auth/login', { email, password });
export const register = (userData) => api.post('/api/auth/register', userData);
export const verifyEmailOtp = (email, otp) => api.post('/api/auth/verify-email', { email, otp });
export const resendVerificationOtp = (email) => api.post('/api/auth/resend-verification-otp', { email });
export const requestPasswordResetOtp = (email) => api.post('/api/auth/forgot-password', { email });
export const resetPasswordWithOtp = (email, otp, password) =>
  api.post('/api/auth/reset-password', { email, otp, password });

// Book endpoints
export const getBooks = (page, limit, category) => 
  api.get('/api/books', { params: { page, limit, category } });
export const getBookById = (id) => api.get(`/api/books/${id}`);
export const addBook = (bookData) => api.post('/api/books', bookData);
export const updateBook = (id, bookData) => api.put(`/api/books/${id}`, bookData);
export const deleteBook = (id) => api.delete(`/api/books/${id}`);
export const getMyBooks = () => api.get('/api/books/mybooks');
export const searchBooks = (params) => api.get('/api/books/search', { params });
export const getSellerBooks = (sellerId, page, limit) => 
  api.get(`/api/books/seller/${sellerId}`, { params: { page, limit } });
export const addBookReview = (id, reviewData) => api.post(`/api/books/${id}/reviews`, reviewData);

// Cart endpoints
export const getCart = () => api.get('/api/cart');
export const addToCart = (bookId, quantity) => 
  api.post('/api/cart/add', { bookId, quantity });
export const removeFromCart = (bookId) => 
  api.post('/api/cart/remove', { bookId });
export const updateCartQuantity = (bookId, quantity) => 
  api.put('/api/cart/update', { bookId, quantity });
export const clearCart = () => api.post('/api/cart/clear');

// Wishlist endpoints
export const getWishlist = () => api.get('/api/wishlist');
export const addToWishlist = (bookId) => 
  api.post('/api/wishlist/add', { bookId });
export const removeFromWishlist = (bookId) => 
  api.post('/api/wishlist/remove', { bookId });

// Order endpoints
export const createOrder = (orderData) => api.post('/api/orders/create', orderData);
export const createExchangeRequest = (exchangeData) => api.post('/api/orders/exchange-request', exchangeData);
export const getUserOrders = () => api.get('/api/orders/my-orders');
export const getOrderById = (orderId) => api.get(`/api/orders/${orderId}`);
export const cancelOrder = (orderId, reason) => 
  api.put(`/api/orders/${orderId}/cancel`, { reason });
export const confirmExchangeCompletion = (orderId) =>
  api.put(`/api/orders/${orderId}/exchange-confirm`);
export const verifyCoupon = (code, amount) => 
  api.post('/api/orders/verify-coupon', { code, amount });

// Admin Order endpoints
export const getAllOrders = () => api.get('/api/orders/admin/all-orders');
export const updateOrderStatus = (orderId, status, reason) => 
  api.put(`/api/orders/admin/${orderId}/update-status`, { status, reason });
export const getOrderStats = () => api.get('/api/orders/admin/stats');

// Seller Order endpoints
export const getSellerOrders = () => api.get('/api/orders/seller/orders');
export const updateSellerOrderStatus = (orderId, status, reason) => 
  api.put(`/api/orders/seller/${orderId}/update-status`, { status, reason });

// Address endpoints
export const getAddresses = () => api.get('/api/addresses');
export const createAddress = (addressData) => api.post('/api/addresses', addressData);
export const updateAddress = (addressId, addressData) => api.put(`/api/addresses/${addressId}`, addressData);
export const deleteAddress = (addressId) => api.delete(`/api/addresses/${addressId}`);

// Payment endpoints
export const createCheckoutSession = (paymentData) =>
  api.post('/api/payment/create-checkout-session', paymentData);
export const getCheckoutSession = (sessionId) =>
  api.get(`/api/payment/checkout-session/${sessionId}`);

// Coupon endpoints
export const getActiveCoupons = () => api.get('/api/coupons/active');
export const getAllCoupons = () => api.get('/api/coupons/all');
export const getCouponById = (id) => api.get(`/api/coupons/${id}`);
export const createCoupon = (couponData) => api.post('/api/coupons/create', couponData);
export const updateCoupon = (id, couponData) => api.put(`/api/coupons/${id}`, couponData);
export const deleteCoupon = (id) => api.delete(`/api/coupons/${id}`);

// Message/Chat endpoints
export const getConversations = () => api.get('/api/messages/conversations');
export const getOrCreateConversation = (participantId, bookId) => 
  api.post('/api/messages/conversations', { participantId, bookId });
export const getMessages = (conversationId) => api.get(`/api/messages/${conversationId}`);
export const sendMessage = (conversationId, receiverId, text) => 
  api.post('/api/messages/send', { conversationId, receiverId, text });
export const markAsRead = (messageId) => api.put(`/api/messages/${messageId}/read`);
export const markConversationAsRead = (conversationId) => 
  api.put(`/api/messages/conversations/${conversationId}/read`);
export const deleteConversation = (conversationId) =>
  api.delete(`/api/messages/conversations/${conversationId}`);
export const deleteMessage = (messageId) => api.delete(`/api/messages/${messageId}`);
export const getUnreadCount = () => api.get('/api/messages/unread-count');
export const getChatSummary = () => api.get('/api/messages/summary');
export const searchConversations = (query) => 
  api.get('/api/messages/search', { params: { query } });

export default api;
