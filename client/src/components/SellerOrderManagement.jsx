import React, { useEffect, useState } from 'react';
import { confirmExchangeCompletion, getSellerOrders as fetchSellerOrdersApi, updateSellerOrderStatus } from '../api';
import FloatingChat from './FloatingChat';
import './SellerOrderManagement.css';

const STATUS_OPTIONS = ['pending', 'processing', 'delivered', 'cancelled'];

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return '#FF9800';
    case 'processing':
      return '#9C27B0';
    case 'delivered':
      return '#4CAF50';
    case 'cancelled':
      return '#F44336';
    default:
      return '#757575';
  }
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

const formatMoney = (amount) => `৳${Number(amount || 0).toFixed(2)}`;

const SellerOrderManagement = ({ onBack }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [chatTarget, setChatTarget] = useState(null);

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(fetchSellerOrders, 7000);
    return () => window.clearInterval(intervalId);
  }, []);

  const fetchSellerOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchSellerOrdersApi();
      const nextOrders = response.data.orders || [];
      setOrders(nextOrders);
    } catch (requestError) {
      console.error('Error fetching seller orders:', requestError);
      setError(requestError.response?.data?.message || 'Failed to load seller orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const targetOrder = orders.find((order) => order._id === orderId);
    const currentStatus = targetOrder?.sellerData?.status || targetOrder?.status;

    if (!targetOrder || newStatus === currentStatus) {
      return;
    }

    const confirmed = window.confirm(`Change seller status to ${newStatus}?`);
    if (!confirmed) {
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      setError('');
      await updateSellerOrderStatus(orderId, newStatus);
      await fetchSellerOrders();
      setExpandedOrder(orderId);
    } catch (requestError) {
      console.error('Error updating seller order status:', requestError);
      setError(requestError.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleConfirmExchange = async (orderId) => {
    try {
      setUpdatingOrderId(orderId);
      await confirmExchangeCompletion(orderId);
      await fetchSellerOrders();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to confirm exchange');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getOrderHeading = (order) =>
    order.orderType === 'exchange'
      ? `Exchange Request #${order.orderNumber || order._id.slice(-8).toUpperCase()}`
      : order.orderNumber || `Order #${order._id.slice(-8).toUpperCase()}`;

  const getStatusLabel = (order, status) => {
    if (order.orderType === 'exchange') {
      if (status === 'processing') return 'Accepted';
      if (status === 'delivered') return 'Exchanged Successfully';
      if (status === 'cancelled') return 'Rejected';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getVisibleStatuses = (order, currentStatus) => {
    if (order.orderType === 'exchange') {
      if (currentStatus === 'pending') return ['pending', 'processing', 'cancelled'];
      if (currentStatus === 'processing') return ['processing', 'delivered', 'cancelled'];
      return [currentStatus];
    }

    if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
      return [currentStatus];
    }

    return STATUS_OPTIONS.filter((status) => status !== 'pending' || currentStatus === 'pending');
  };

  if (loading) {
    return (
      <div className="seller-order-management">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="seller-order-management">
      <div className="som-header">
        {onBack && (
          <button className="som-back-btn" onClick={onBack}>
            ← Back to Profile
          </button>
        )}
        <h2>Order Management</h2>
        <p className="som-subtitle">Review customer details, shipping info, and update your order status.</p>
      </div>

      {error && <div className="som-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>No seller orders yet</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const sellerStatus = order.sellerData?.status || order.status;
            const statusHistory = order.sellerData?.statusHistory?.length
              ? order.sellerData.statusHistory
              : order.statusHistory || [];

            return (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>{getOrderHeading(order)}</h3>
                    <p className="order-date">{order.orderType === 'exchange' ? 'Requested' : 'Placed'} {formatDate(order.createdAt)}</p>
                    <p className="order-meta">
                      Payment: {order.orderType === 'exchange' ? 'Exchange Request' : order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Card'}
                    </p>
                  </div>
                  <div
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(sellerStatus) }}
                  >
                    {getStatusLabel(order, sellerStatus)}
                  </div>
                </div>

                <div className="customer-info">
                  <h4>Customer Details</h4>
                  <p><strong>Name:</strong> {order.user?.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {order.user?.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {order.user?.phone || order.shippingAddress?.phone || 'N/A'}</p>
                </div>

                <div className="shipping-info">
                  <h4>{order.orderType === 'exchange' ? 'Exchange Notes' : 'Shipping Address'}</h4>
                  {order.orderType === 'exchange' ? (
                    <>
                      <p><strong>Requested Book:</strong> {order.exchangeRequest?.requestedBook?.title || order.items?.[0]?.book?.title}</p>
                      <p><strong>Offered Book:</strong> {order.exchangeRequest?.offeredBook?.title || 'N/A'}</p>
                      <p><strong>Buyer Notes:</strong> {order.exchangeRequest?.details || order.notes || 'No details provided'}</p>
                    </>
                  ) : (
                    <>
                      <p>{order.shippingAddress?.fullName || 'Customer name unavailable'}</p>
                      <p>{order.shippingAddress?.address || 'Address unavailable'}</p>
                      <p>
                        {[order.shippingAddress?.thana, order.shippingAddress?.district]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      <p>{order.shippingAddress?.division || ''}</p>
                      {order.shippingAddress?.zipCode && <p>Zip: {order.shippingAddress.zipCode}</p>}
                      {order.shippingAddress?.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                    </>
                  )}
                </div>

                <div className="order-items">
                  <h4>Your Items</h4>
                  {order.items.map((item) => (
                    <div key={item._id} className="item-row">
                      <div className="item-details">
                        <p className="item-title">{item.book?.title || 'Book unavailable'}</p>
                        <p className="item-author">{item.book?.author || 'Unknown author'}</p>
                        <p className="item-meta">
                          Qty: {item.quantity} × {formatMoney(item.price)}
                        </p>
                      </div>
                      <div className="item-total">{formatMoney(item.quantity * item.price)}</div>
                    </div>
                  ))}
                </div>

                <div className="order-total">
                  <p><strong>Order Total:</strong> {formatMoney(order.totalAmount)}</p>
                </div>

                <div className="status-controls">
                  <label htmlFor={`status-${order._id}`}>Update Your Status:</label>
                  <select
                    id={`status-${order._id}`}
                    value={sellerStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="status-select"
                    disabled={updatingOrderId === order._id || ['delivered', 'cancelled'].includes(sellerStatus)}
                  >
                    {getVisibleStatuses(order, sellerStatus).map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(order, status)}
                      </option>
                    ))}
                  </select>
                  {updatingOrderId === order._id && (
                    <span className="status-updating">Saving...</span>
                  )}
                </div>

                {order.orderType === 'exchange' && sellerStatus === 'processing' && (
                  <div className="status-controls">
                    <label>Exchange Completion:</label>
                    <button
                      className="status-select"
                      onClick={() => handleConfirmExchange(order._id)}
                      disabled={updatingOrderId === order._id || order.exchangeRequest?.sellerConfirmed}
                    >
                      {order.exchangeRequest?.sellerConfirmed ? 'Marked By You' : 'Mark Exchanged Successfully'}
                    </button>
                    <button
                      className="status-select"
                      onClick={() => setChatTarget({ userId: order.user?._id, name: order.user?.name, bookId: order.exchangeRequest?.requestedBook?._id || order.items?.[0]?.book?._id })}
                    >
                      Open Chat
                    </button>
                  </div>
                )}

                {statusHistory.length > 0 && (
                  <div className="status-history">
                    <button
                      className="toggle-history"
                      onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                    >
                      {expandedOrder === order._id ? 'Hide' : 'View'} Status History ({statusHistory.length})
                    </button>

                    {expandedOrder === order._id && (
                      <div className="history-timeline">
                        {statusHistory.map((entry, idx) => (
                          <div key={`${order._id}-${idx}`} className="history-entry">
                            <div
                              className="history-status"
                              style={{ backgroundColor: getStatusColor(entry.status) }}
                            >
                              {entry.status}
                            </div>
                            <div className="history-details">
                              <p className="history-time">{formatDate(entry.changedAt)}</p>
                              {entry.reason && <p className="history-reason">{entry.reason}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {chatTarget && (
        <FloatingChat
          sellerId={chatTarget.userId}
          sellerName={chatTarget.name}
          token={JSON.parse(localStorage.getItem('bookshareUser') || '{}').token}
          bookId={chatTarget.bookId}
          onClose={() => setChatTarget(null)}
        />
      )}
    </div>
  );
};

export default SellerOrderManagement;
