import React, { useState, useEffect } from 'react';
import { addBookReview, cancelOrder, confirmExchangeCompletion, getUserOrders } from '../api';
import getImageUrl from '../utils/getImageUrl';
import './OrderDetails.css';

const OrderDetails = ({ onBack }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [ratingDrafts, setRatingDrafts] = useState({});
  const [reviewSubmitting, setReviewSubmitting] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(fetchOrders, 7000);
    return () => window.clearInterval(intervalId);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getUserOrders();
      const nextOrders = response.data.orders || [];
      setOrders(nextOrders);
      setSelectedOrder((currentSelectedOrder) => {
        if (!currentSelectedOrder) {
          return currentSelectedOrder;
        }

        return nextOrders.find((order) => order._id === currentSelectedOrder._id) || currentSelectedOrder;
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      processing: '#9c27b0',
      delivered: '#4caf50',
      cancelled: '#f44336'
    };
    return colors[status] || '#999';
  };

  const getDisplayStatus = (order) => {
    if (order.orderType === 'exchange' && order.status === 'delivered') {
      return 'Exchanged Successfully';
    }
    return order.status;
  };

  const handleCancelClick = (orderId) => {
    setCancelling(orderId);
    setShowCancelModal(true);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!cancelling) return;

    try {
      await cancelOrder(cancelling, cancelReason);
      setOrders(orders.map(order => 
        order._id === cancelling 
          ? { ...order, status: 'cancelled' }
          : order
      ));
      setShowCancelModal(false);
      setCancelling(null);
      setCancelReason('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const canCancelOrder = (order) => {
    return order.status === 'pending';
  };

  const getCurrentUserId = () => {
    try {
      return JSON.parse(localStorage.getItem('bookshareUser') || '{}')._id;
    } catch {
      return null;
    }
  };

  const hasUserReviewedBook = (book) => {
    const currentUserId = getCurrentUserId();
    return book?.reviews?.some((review) => {
      const reviewUserId = review.user?._id || review.user;
      return reviewUserId?.toString() === currentUserId;
    });
  };

  const handleRatingChange = (bookId, field, value) => {
    setRatingDrafts((currentDrafts) => ({
      ...currentDrafts,
      [bookId]: {
        ...currentDrafts[bookId],
        [field]: value
      }
    }));
  };

  const handleSubmitReview = async (bookId) => {
    const review = ratingDrafts[bookId];
    if (!review?.rating) {
      setError('Please select a star rating before submitting.');
      return;
    }

    try {
      setReviewSubmitting(bookId);
      await addBookReview(bookId, {
        rating: review.rating,
        comment: review.comment || ''
      });
      await fetchOrders();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting('');
    }
  };

  const handleConfirmExchange = async (orderId) => {
    try {
      await confirmExchangeCompletion(orderId);
      await fetchOrders();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to confirm exchange');
    }
  };

  if (loading) {
    return (
      <div className="order-details-container">
        <div className="loading">Loading your orders...</div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="order-details-container">
        <div className="order-detail-view">
          <button className="back-btn" onClick={() => setSelectedOrder(null)}>
            ← Back to Orders
          </button>

          <div className="order-detail-header">
            <div className="order-header-info">
              <h2>Order Details</h2>
              <p className="order-number">Order: {selectedOrder.orderNumber}</p>
            </div>
            <div className="order-status" style={{ borderColor: getStatusColor(selectedOrder.status) }}>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
              >
                {getDisplayStatus(selectedOrder).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="order-detail-grid">
            {/* Order Info */}
            <div className="detail-section">
              <h3>Order Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Order Date</span>
                  <span className="value">{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Total Amount</span>
                  <span className="value amount">৳ {selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Payment Method</span>
                  <span className="value">{selectedOrder.orderType === 'exchange' ? 'Exchange Request' : selectedOrder.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Card'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Payment Status</span>
                  <span className="value">{selectedOrder.orderType === 'exchange' ? 'Not Applicable' : selectedOrder.paymentStatus}</span>
                </div>
              </div>
            </div>

            {selectedOrder.orderType === 'exchange' && (
              <div className="detail-section full-width">
                <h3>Exchange Request</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Requested Book</span>
                    <span className="value">{selectedOrder.exchangeRequest?.requestedBook?.title || selectedOrder.items?.[0]?.book?.title}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Offered Book</span>
                    <span className="value">{selectedOrder.exchangeRequest?.offeredBook?.title || '-'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Your Details</span>
                    <span className="value">{selectedOrder.exchangeRequest?.details || selectedOrder.notes || '-'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Completion Status</span>
                    <span className="value">
                      Buyer: {selectedOrder.exchangeRequest?.buyerConfirmed ? 'Confirmed' : 'Pending'} | Seller: {selectedOrder.exchangeRequest?.sellerConfirmed ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="detail-section">
              <h3>{selectedOrder.orderType === 'exchange' ? 'Contact Details' : 'Shipping Address'}</h3>
              <div className="address-info">
                <p><strong>{selectedOrder.shippingAddress.fullName}</strong></p>
                <p>{selectedOrder.shippingAddress.address}</p>
                <p>{selectedOrder.shippingAddress.thana}, {selectedOrder.shippingAddress.district}</p>
                <p>{selectedOrder.shippingAddress.division}</p>
                {selectedOrder.shippingAddress.zipCode && <p>Zip: {selectedOrder.shippingAddress.zipCode}</p>}
                <p>Phone: {selectedOrder.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="detail-section full-width">
              <h3>Order Items</h3>
              <div className="items-table">
                <div className="table-header">
                  <div className="col-item">Item</div>
                  <div className="col-qty">Quantity</div>
                  <div className="col-price">Unit Price</div>
                  <div className="col-total">Total</div>
                </div>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="table-row">
                    <div className="col-item">
                      <div className="item-info">
                        {item.book.images?.[0] && (
                          <img src={getImageUrl(item.book.images[0])} alt={item.book.title} />
                        )}
                        <div>
                          <p className="item-title">{item.book.title}</p>
                          <p className="item-author">by {item.book.author}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-qty">{item.quantity}</div>
                    <div className="col-price">৳ {item.price.toFixed(2)}</div>
                    <div className="col-total">৳ {(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="detail-section">
              <h3>Price Breakdown</h3>
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal</span>
                  <span>৳ {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.coupon && selectedOrder.coupon.discountAmount > 0 && (
                  <div className="price-row discount">
                    <span>Discount ({selectedOrder.coupon.code})</span>
                    <span>- ৳ {selectedOrder.coupon.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {selectedOrder.shippingCost > 0 && (
                  <div className="price-row">
                    <span>Shipping</span>
                    <span>৳ {selectedOrder.shippingCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="price-row total">
                  <span>Total</span>
                  <span>৳ {selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="detail-section full-width">
              <h3>Order Timeline</h3>
              <div className="timeline">
                {selectedOrder.statusHistory?.map((history, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <p className="timeline-status" style={{ color: getStatusColor(history.status) }}>
                        {history.status.toUpperCase()}
                      </p>
                      <p className="timeline-date">{formatDate(history.changedAt)}</p>
                      {history.reason && <p className="timeline-reason">{history.reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {canCancelOrder(selectedOrder) && (
              <div className="detail-section full-width">
                <button 
                  className="cancel-order-btn"
                  onClick={() => handleCancelClick(selectedOrder._id)}
                >
                  Cancel Order
                </button>
              </div>
            )}

            {selectedOrder.orderType === 'exchange' && selectedOrder.status !== 'cancelled' && (
              <div className="detail-section full-width">
                <button className="cancel-order-btn" onClick={() => handleConfirmExchange(selectedOrder._id)}>
                  {selectedOrder.exchangeRequest?.buyerConfirmed ? 'Exchange Marked By You' : 'Mark Exchange Successful'}
                </button>
              </div>
            )}

            {selectedOrder.status === 'delivered' && selectedOrder.orderType === 'purchase' && (
              <div className="detail-section full-width">
                <h3>Rate Your Books</h3>
                <div className="timeline">
                  {selectedOrder.items.map((orderItem) => (
                    <div key={orderItem._id} className="timeline-item">
                      <div className="timeline-content" style={{ width: '100%' }}>
                        <p className="timeline-status">{orderItem.book.title}</p>
                        {hasUserReviewedBook(orderItem.book) ? (
                          <p className="timeline-reason">You already reviewed this book.</p>
                        ) : (
                          <>
                            <select
                              value={ratingDrafts[orderItem.book._id]?.rating || ''}
                              onChange={(event) => handleRatingChange(orderItem.book._id, 'rating', Number(event.target.value))}
                              style={{ padding: '10px', borderRadius: '8px', marginBottom: '10px', width: '100%' }}
                            >
                              <option value="">Select rating</option>
                              {[5, 4, 3, 2, 1].map((star) => (
                                <option key={star} value={star}>
                                  {star} Star{star === 1 ? '' : 's'}
                                </option>
                              ))}
                            </select>
                            <textarea
                              value={ratingDrafts[orderItem.book._id]?.comment || ''}
                              onChange={(event) => handleRatingChange(orderItem.book._id, 'comment', event.target.value)}
                              placeholder="Share a short review..."
                              rows="3"
                              style={{ width: '100%', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}
                            />
                            <button
                              className="view-btn"
                              onClick={() => handleSubmitReview(orderItem.book._id)}
                              disabled={reviewSubmitting === orderItem.book._id}
                            >
                              {reviewSubmitting === orderItem.book._id ? 'Submitting...' : 'Submit Review'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-container">
      <div className="orders-list-view">
        <div className="header">
          <div>
            <h1>My Orders</h1>
            <p className="subtitle">Track and manage your orders</p>
          </div>
          <button className="back-btn" onClick={onBack}>← Back to Profile</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No orders yet</p>
            <p className="empty-desc">Start shopping to create your first order</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="card-header">
                  <div>
                    <p className="card-order-number">{order.orderNumber}</p>
                    <p className="card-date">{formatDate(order.createdAt)}</p>
                  </div>
                  <div 
                    className="card-status"
                    style={{ backgroundColor: getStatusColor(order.status) + '20', borderColor: getStatusColor(order.status) }}
                  >
                    <span style={{ color: getStatusColor(order.status) }}>
                      {getDisplayStatus(order).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="card-items">
                  <p className="items-count">{order.items.length} item(s)</p>
                  <div className="items-preview">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="item-tag">{item.book.title}</span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="item-tag">+{order.items.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="card-divider"></div>

                <div className="card-footer">
                  <div>
                    <p className="card-amount">৳ {order.totalAmount.toFixed(2)}</p>
                    <p className="card-label">Total Amount</p>
                  </div>
                  <button 
                    className="view-btn"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="modal-backdrop">
            <div className="modal">
              <h2>Cancel Order</h2>
              <p>Are you sure you want to cancel this order? This action cannot be undone.</p>
              
              <div className="form-group">
                <label>Reason for cancellation (optional)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Tell us why you're cancelling..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Order
                </button>
                <button 
                  className="btn-danger"
                  onClick={handleConfirmCancel}
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
