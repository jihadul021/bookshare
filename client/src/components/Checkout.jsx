import React, { useState, useEffect } from 'react';
import { createAddress as saveAddress, createOrder, getAddresses, verifyCoupon } from '../api';
import './Checkout.css';

const Checkout = ({ cart, onOrderSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    division: '',
    district: '',
    thana: '',
    address: '',
    zipCode: '',
  });

  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(false);

  const divisions = [
    'Dhaka',
    'Chattogram',
    'Khulna',
    'Rajshahi',
    'Barisal',
    'Sylhet',
    'Rangpur',
    'Mymensingh'
  ];

  // Sample districts for each division (you can expand this)
  const districtsByDivision = {
    'Dhaka': ['Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Manikganj', 'Munshiganj', 'Shariatpur', 'Rajbari'],
    'Chattogram': ['Chattogram', 'Cox\'s Bazar', 'Bandarban', 'Khagrachari', 'Feni', 'Lakshmipur', 'Noakhali'],
    'Khulna': ['Khulna', 'Bagerhat', 'Satkhira', 'Jhenaidah', 'Magura', 'Narail'],
    'Rajshahi': ['Rajshahi', 'Natore', 'Naogaon', 'Chapainawabganj', 'Bogura', 'Pabna'],
    'Barisal': ['Barisal', 'Bhola', 'Pirojpur', 'Jhalokati', 'Patuakhali', 'Barguna'],
    'Sylhet': ['Sylhet', 'Moulvibazar', 'Sunamganj', 'Habiganj'],
    'Rangpur': ['Rangpur', 'Dinajpur', 'Kurigram', 'Thakurgaon', 'Nilphamari', 'Gaibandha'],
    'Mymensingh': ['Mymensingh', 'Jamalpur', 'Sherpur', 'Kishoreganj']
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await getAddresses();
      const addresses = response.data.addresses || [];
      setSavedAddresses(addresses);

      const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
        setUseSavedAddress(true);
        setFormData({
          fullName: defaultAddress.fullName || '',
          phone: defaultAddress.phone || '',
          division: defaultAddress.division || '',
          district: defaultAddress.district || '',
          thana: defaultAddress.thana || '',
          address: defaultAddress.address || '',
          zipCode: defaultAddress.zipCode || ''
        });
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (useSavedAddress) {
      setUseSavedAddress(false);
      setSelectedAddressId('');
    }
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleAddressSelection = (addressId) => {
    setSelectedAddressId(addressId);

    if (!addressId) {
      setUseSavedAddress(false);
      setFormData({
        fullName: '',
        phone: '',
        division: '',
        district: '',
        thana: '',
        address: '',
        zipCode: '',
      });
      return;
    }

    const selectedAddress = savedAddresses.find((address) => address._id === addressId);
    if (!selectedAddress) {
      return;
    }

    setUseSavedAddress(true);
    setFormData({
      fullName: selectedAddress.fullName || '',
      phone: selectedAddress.phone || '',
      division: selectedAddress.division || '',
      district: selectedAddress.district || '',
      thana: selectedAddress.thana || '',
      address: selectedAddress.address || '',
      zipCode: selectedAddress.zipCode || '',
    });
    setError('');
  };

  const handleVerifyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    
    try {
      const subtotal = cart.totalPrice;
      const response = await verifyCoupon(couponCode, subtotal);
      setCouponData(response.data.coupon);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponData(null);
    setCouponError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.phone || !formData.division || 
        !formData.district || !formData.thana || !formData.address) {
      setError('Please fill all required fields');
      return;
    }

    if (!cart || cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!useSavedAddress && saveNewAddress) {
        await saveAddress({
          ...formData,
          isDefault: savedAddresses.length === 0
        });
      }

      const orderData = {
        items: cart.items.map(item => ({
          bookId: item.book._id,
          quantity: item.quantity
        })),
        shippingAddress: formData,
        couponCode: couponCode || null,
        paymentMethod
      };

      const response = await createOrder(orderData);
      
      if (response.data.success) {
        onOrderSuccess(response.data.order);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const subtotal = cart?.totalPrice || 0;
  const discountAmount = couponData?.discountAmount || 0;
  const totalAmount = subtotal - discountAmount;

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <h1 className="checkout-title">Checkout</h1>
        
        <div className="checkout-grid">
          {/* Left Column - Form */}
          <div className="checkout-form-section">
            <form onSubmit={handleSubmit}>
              {/* Shipping Address */}
              <div className="form-section">
                <h2 className="section-title">Shipping Address</h2>

                {savedAddresses.length > 0 && (
                  <div className="form-group">
                    <label htmlFor="savedAddress">Choose Saved Address</label>
                    <select
                      id="savedAddress"
                      value={selectedAddressId}
                      onChange={(e) => handleAddressSelection(e.target.value)}
                    >
                      <option value="">Use a new address</option>
                      {savedAddresses.map((address) => (
                        <option key={address._id} value={address._id}>
                          {address.fullName} - {address.district}, {address.division}
                          {address.isDefault ? ' (Default)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="division">Division *</label>
                    <select
                      id="division"
                      name="division"
                      value={formData.division}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Division</option>
                      {divisions.map(div => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="district">District *</label>
                    <select
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.division}
                    >
                      <option value="">Select District</option>
                      {formData.division && districtsByDivision[formData.division]?.map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="thana">Thana/Upazilla *</label>
                  <input
                    type="text"
                    id="thana"
                    name="thana"
                    value={formData.thana}
                    onChange={handleInputChange}
                    placeholder="Enter thana/upazilla name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Specific Address *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter house number, street, area..."
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="zipCode">Zip Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="Enter zip code"
                  />
                </div>

                {!useSavedAddress && (
                  <label className="payment-option">
                    <input
                      type="checkbox"
                      checked={saveNewAddress}
                      onChange={(e) => setSaveNewAddress(e.target.checked)}
                    />
                    <span className="payment-label">
                      <strong>Save this address</strong>
                      <small>Use this address again on your next checkout</small>
                    </span>
                  </label>
                )}
              </div>

              {/* Coupon */}
              <div className="form-section">
                <h2 className="section-title">Discount Code</h2>
                <div className="coupon-input-group">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    disabled={couponData !== null}
                  />
                  {!couponData && (
                    <button
                      type="button"
                      onClick={handleVerifyCoupon}
                      disabled={couponLoading}
                      className="verify-btn"
                    >
                      {couponLoading ? 'Verifying...' : 'Apply'}
                    </button>
                  )}
                  {couponData && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {couponError && <p className="error-text">{couponError}</p>}
                {couponData && (
                  <div className="coupon-success">
                    <p className="coupon-info">✓ {couponData.description}</p>
                    <p className="discount-amount">Discount: ৳ {couponData.discountAmount.toFixed(2)}</p>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="form-section">
                <h2 className="section-title">Payment Method</h2>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-label">
                      <strong>Cash on Delivery</strong>
                      <small>Pay when your order arrives</small>
                    </span>
                  </label>
                  <label className="payment-option disabled">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      disabled
                    />
                    <span className="payment-label">
                      <strong>Card Payment</strong>
                      <small>Coming soon</small>
                    </span>
                  </label>
                </div>
              </div>

              {error && <p className="error-message">{error}</p>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Processing...' : 'Complete Order'}
              </button>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-summary-section">
            <h2 className="summary-title">Order Summary</h2>
            
            <div className="order-items">
              {cart?.items?.map(item => (
                <div key={item.book._id} className="order-item">
                  <img src={item.book.images?.[0]} alt={item.book.title} />
                  <div className="item-details">
                    <p className="item-title">{item.book.title}</p>
                    <p className="item-quantity">Qty: {item.quantity}</p>
                    <p className="item-price">৳ {item.book.price.toFixed(2)}</p>
                  </div>
                  <p className="item-subtotal">৳ {(item.book.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Subtotal:</span>
                <span>৳ {subtotal.toFixed(2)}</span>
              </div>
              {couponData && (
                <div className="price-row discount">
                  <span>Discount ({couponData.code}):</span>
                  <span>- ৳ {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="price-row shipping">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
            </div>

            <div className="summary-divider"></div>

            <div className="price-row total">
              <span>Total Amount:</span>
              <span>৳ {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
