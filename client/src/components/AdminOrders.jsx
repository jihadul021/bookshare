import React, { useCallback, useEffect, useState } from 'react';
import './AdminOrders.css';

const getAuthToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('bookshareUser') || '{}');
    return user.token || null;
  } catch {
    return null;
  }
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

const getStatusClass = (status) => `status-pill ${status || 'pending'}`;

const getItemSellerName = (item) => item.book?.seller?.name || 'Unknown seller';

const getPaymentStatusLabel = (status) => {
  const labels = {
    completed: 'Paid',
    pending: 'Pending',
    failed: 'Failed'
  };

  return labels[status] || status;
};

const resolveDisplayedPaymentStatus = (order) =>
  order?.paymentMethod === 'card' && order?.paymentStatus === 'pending'
    ? 'completed'
    : order?.paymentStatus;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      let url = '/api/admin/orders';
      if (search) {
        url += `?search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setSelectedOrder((currentSelectedOrder) => {
        if (!currentSelectedOrder) {
          return data.orders?.[0] || null;
        }

        return data.orders?.find((order) => order._id === currentSelectedOrder._id) || data.orders?.[0] || null;
      });
      setError('');
    } catch {
      setError('Error loading orders');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="admin-orders">
      <div className="management-header">
        <div>
          <h1>Order Details</h1>
          <p className="management-subtitle">Track every past and present order with complete customer, seller, and timeline details.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by order number or customer name..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="search-input"
        />
      </div>

      <div className="orders-layout">
        <section className="orders-list-panel">
          {loading ? (
            <div className="orders-loading">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="orders-empty">No orders found.</div>
          ) : (
            orders.map((order) => (
              <button
                key={order._id}
                type="button"
                className={`order-summary-card ${selectedOrder?._id === order._id ? 'active' : ''}`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="order-summary-head">
                  <strong>{order.orderNumber}</strong>
                  <span className={getStatusClass(order.status)}>{order.status}</span>
                </div>
                <p>{order.user?.name || order.shippingAddress?.fullName || 'Unknown customer'}</p>
                <div className="order-summary-meta">
                  <span>Tk {order.totalAmount?.toLocaleString?.() || 0}</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </button>
            ))
          )}
        </section>

        <section className="order-detail-panel">
          {!selectedOrder ? (
            <div className="orders-empty">Select an order to see full details.</div>
          ) : (
            <>
              <div className="detail-hero">
                <div>
                  <h2>{selectedOrder.orderNumber}</h2>
                  <p>Placed {formatDate(selectedOrder.createdAt)}</p>
                </div>
                <span className={getStatusClass(selectedOrder.status)}>{selectedOrder.status}</span>
              </div>

              <div className="detail-grid">
                <article className="detail-card">
                  <h3>Customer</h3>
                  <div className="detail-stack">
                    <span><strong>Name:</strong> {selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName || '-'}</span>
                    <span><strong>Email:</strong> {selectedOrder.user?.email || '-'}</span>
                    <span><strong>Phone:</strong> {selectedOrder.user?.phone || selectedOrder.shippingAddress?.phone || '-'}</span>
                    <span><strong>User ID:</strong> {selectedOrder.user?._id || '-'}</span>
                  </div>
                </article>

                <article className="detail-card">
                  <h3>Delivery</h3>
                  <div className="detail-stack">
                    <span><strong>Recipient:</strong> {selectedOrder.shippingAddress?.fullName || '-'}</span>
                    <span><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || '-'}</span>
                    <span><strong>Address:</strong> {selectedOrder.shippingAddress?.address || '-'}</span>
                    <span>
                      <strong>Region:</strong> {selectedOrder.shippingAddress?.thana || '-'}, {selectedOrder.shippingAddress?.district || '-'}, {selectedOrder.shippingAddress?.division || '-'}
                    </span>
                    <span><strong>Zip:</strong> {selectedOrder.shippingAddress?.zipCode || '-'}</span>
                  </div>
                </article>

                <article className="detail-card">
                  <h3>Payment</h3>
                  <div className="detail-stack">
                    <span><strong>Method:</strong> {selectedOrder.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Card'}</span>
                    <span><strong>Payment Status:</strong> {getPaymentStatusLabel(resolveDisplayedPaymentStatus(selectedOrder))}</span>
                    <span><strong>Subtotal:</strong> Tk {selectedOrder.subtotal?.toLocaleString?.() || 0}</span>
                    <span><strong>Discount:</strong> Tk {selectedOrder.coupon?.discountAmount?.toLocaleString?.() || 0}</span>
                    <span><strong>Shipping:</strong> Tk {selectedOrder.shippingCost?.toLocaleString?.() || 0}</span>
                    <span><strong>Total:</strong> Tk {selectedOrder.totalAmount?.toLocaleString?.() || 0}</span>
                  </div>
                </article>

                <article className="detail-card">
                  <h3>Order Meta</h3>
                  <div className="detail-stack">
                    <span><strong>Order ID:</strong> {selectedOrder._id}</span>
                    <span><strong>Tracking Number:</strong> {selectedOrder.trackingNumber || '-'}</span>
                    <span><strong>Delivered At:</strong> {selectedOrder.deliveredAt ? formatDate(selectedOrder.deliveredAt) : '-'}</span>
                    <span><strong>Cancelled At:</strong> {selectedOrder.cancelledAt ? formatDate(selectedOrder.cancelledAt) : '-'}</span>
                    <span><strong>Cancellation Reason:</strong> {selectedOrder.cancellationReason || '-'}</span>
                    <span><strong>Notes:</strong> {selectedOrder.notes || '-'}</span>
                  </div>
                </article>
              </div>

              <article className="detail-card">
                <h3>Items</h3>
                <div className="order-items-table">
                  <div className="order-items-header">
                    <span>Book</span>
                    <span>Author</span>
                    <span>Qty</span>
                    <span>Price</span>
                    <span>Seller</span>
                    <span>Stock Left</span>
                  </div>
                  {selectedOrder.items?.map((item) => (
                    <div key={item._id} className="order-items-row">
                      <span>{item.book?.title || 'Removed book'}</span>
                      <span>{item.book?.author || '-'}</span>
                      <span>{item.quantity}</span>
                      <span>Tk {item.price}</span>
                      <span>{getItemSellerName(item)}</span>
                      <span>{item.book?.stock ?? '-'}</span>
                    </div>
                  ))}
                </div>
              </article>

              <div className="detail-grid">
                <article className="detail-card">
                  <h3>Seller Status</h3>
                  {selectedOrder.sellers?.length > 0 ? (
                    <div className="stack-list">
                      {selectedOrder.sellers.map((seller) => (
                        <div key={seller._id || seller.sellerId?._id || seller.sellerName} className="stack-item">
                          <strong>{seller.sellerId?.name || seller.sellerName || 'Unknown seller'}</strong>
                          <span>{seller.sellerId?.email || '-'}</span>
                          <span className={getStatusClass(seller.status)}>{seller.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-copy">No seller status data.</p>
                  )}
                </article>

                <article className="detail-card">
                  <h3>Status Timeline</h3>
                  {selectedOrder.statusHistory?.length > 0 ? (
                    <div className="timeline">
                      {selectedOrder.statusHistory.map((event, index) => (
                        <div key={`${event.status}-${index}`} className="timeline-item">
                          <span className="timeline-dot"></span>
                          <div>
                            <strong>{event.status}</strong>
                            <p>{formatDate(event.changedAt)}</p>
                            <p>{event.reason || 'No reason provided'}</p>
                            <p>By: {event.changedBy?.name || event.changedBy?.email || 'System'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-copy">No status history available.</p>
                  )}
                </article>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminOrders;
