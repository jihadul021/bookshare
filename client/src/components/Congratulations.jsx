import React, { useState } from 'react';
import './Congratulations.css';

const Congratulations = ({ order, onBackHome }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="congratulations-container">
      <div className="success-card">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        <h1 className="success-title">Order Confirmed!</h1>
        <p className="success-subtitle">Thank you for your purchase</p>

        <div className="order-details-card">
          <div className="order-number-section">
            <p className="label">Order Number</p>
            <div className="order-number">
              <span>{order.orderNumber}</span>
              <button 
                className="copy-btn"
                onClick={handleCopyOrderNumber}
                title="Copy order number"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="order-info-grid">
            <div className="info-item">
              <p className="label">Order Date</p>
              <p className="value">{formatDate(order.createdAt)}</p>
            </div>

            <div className="info-item">
              <p className="label">Status</p>
              <p className="value status">
                <span className={`status-badge ${order.status}`}>{order.status}</span>
              </p>
            </div>

            <div className="info-item">
              <p className="label">Payment Method</p>
              <p className="value">{order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Card'}</p>
            </div>

            <div className="info-item">
              <p className="label">Total Amount</p>
              <p className="value total">৳ {order.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="divider"></div>

          <div className="shipping-info">
            <h3 className="section-subtitle">Shipping Address</h3>
            <div className="address-box">
              <p><strong>{order.shippingAddress.fullName}</strong></p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.thana}, {order.shippingAddress.district}</p>
              <p>{order.shippingAddress.division}</p>
              {order.shippingAddress.zipCode && <p>Zip: {order.shippingAddress.zipCode}</p>}
              <p>Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="divider"></div>

          <div className="items-summary">
            <h3 className="section-subtitle">Order Items ({order.items.length})</h3>
            <div className="items-list">
              {order.items.map((item, index) => (
                <div key={index} className="item-row">
                  <span className="item-name">{item.book.title}</span>
                  <span className="item-qty">x{item.quantity}</span>
                  <span className="item-price">৳ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="divider"></div>

          <div className="price-summary">
            <div className="price-row">
              <span>Subtotal:</span>
              <span>৳ {order.subtotal.toFixed(2)}</span>
            </div>
            {order.coupon && order.coupon.discountAmount > 0 && (
              <div className="price-row discount">
                <span>Discount ({order.coupon.code}):</span>
                <span>- ৳ {order.coupon.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {order.shippingCost > 0 && (
              <div className="price-row">
                <span>Shipping:</span>
                <span>৳ {order.shippingCost.toFixed(2)}</span>
              </div>
            )}
            <div className="price-row total">
              <span>Total:</span>
              <span>৳ {order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="progress-section">
          <h3 className="section-subtitle">What's Next?</h3>
          <div className="progress-steps">
            <div className="step active">
              <div className="step-icon">✓</div>
              <p className="step-label">Order Confirmed</p>
              <p className="step-desc">Your order has been received</p>
            </div>
            <div className="step-line"></div>
            <div className="step">
              <div className="step-icon">📦</div>
              <p className="step-label">Processing</p>
              <p className="step-desc">We're preparing your books</p>
            </div>
            <div className="step-line"></div>
            <div className="step">
              <div className="step-icon">🚚</div>
              <p className="step-label">Shipped</p>
              <p className="step-desc">Order on its way to you</p>
            </div>
            <div className="step-line"></div>
            <div className="step">
              <div className="step-icon">📬</div>
              <p className="step-label">Delivered</p>
              <p className="step-desc">Your books have arrived</p>
            </div>
          </div>
        </div>

        <div className="info-box">
          <p>
            A confirmation email has been sent to your registered email address. 
            You can track your order status from your account under "Order Details".
          </p>
        </div>

        <button className="home-btn" onClick={onBackHome}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default Congratulations;
