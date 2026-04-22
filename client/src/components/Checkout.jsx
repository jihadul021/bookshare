import React, { useState, useEffect } from 'react';
import { createAddress as saveAddress, createExchangeRequest, createOrder, getAddresses, getMyBooks, verifyCoupon } from '../api';
import getImageUrl from '../utils/getImageUrl';
import './Checkout.css';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePayment from './PaymentPage';


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const Checkout = ({ cart, onOrderSuccess }) => {
  const exchangeMode = Boolean(cart?.exchangeMode);
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
  const [myBooks, setMyBooks] = useState([]);
  const [exchangeForm, setExchangeForm] = useState({
    offeredBookId: '',
    details: ''
  });

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

  const districtsByDivision = {
    'Dhaka': ['Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Manikganj', 'Munshiganj', 'Shariatpur', 'Rajbari'],
    'Chattogram': ["Chattogram", "Cox's Bazar", 'Bandarban', 'Khagrachari', 'Feni', 'Lakshmipur', 'Noakhali'],
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

  useEffect(() => {
    if (exchangeMode) {
      loadMyBooks();
      setPaymentMethod('cash_on_delivery');
    }
  }, [exchangeMode]);

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
    if (!selectedAddress) return;

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

  const loadMyBooks = async () => {
    try {
      const response = await getMyBooks();
      const books = response.data || [];
      const filteredBooks = books.filter((book) => book._id !== cart?.requestedBook?._id);
      setMyBooks(filteredBooks);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your books for exchange');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (exchangeMode) {
      if (!exchangeForm.offeredBookId) {
        setError('Please choose which book you want to offer.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await createExchangeRequest({
          requestedBookId: cart?.requestedBook?._id,
          offeredBookId: exchangeForm.offeredBookId,
          details: exchangeForm.details
        });

        if (response.data.success) {
          onOrderSuccess(response.data.order);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to send exchange request');
      } finally {
        setLoading(false);
      }

      return;
    }

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
          fullName: formData.fullName,
          phone: formData.phone,
          division: formData.division,
          district: formData.district,
          thana: formData.thana,
          address: formData.address,
          zipCode: formData.zipCode,
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

  // ✅ Called after Stripe payment succeeds
  const handleStripeOrderSubmit = async (paymentIntentId) => {
    // Validate form first
    if (!formData.fullName || !formData.phone || !formData.division ||
      !formData.district || !formData.thana || !formData.address) {
      setError('Please fill all required shipping fields before paying');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!useSavedAddress && saveNewAddress) {
        await saveAddress({
          fullName: formData.fullName,
          phone: formData.phone,
          division: formData.division,
          district: formData.district,
          thana: formData.thana,
          address: formData.address,
          zipCode: formData.zipCode,
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
        paymentMethod: 'card',
        paymentIntentId
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
  const offeredBook = myBooks.find((book) => book._id === exchangeForm.offeredBookId);

  // ✅ FIXED: Elements wraps the entire return, not just part of the form
  return (
    <Elements stripe={stripePromise}>
      <div className="checkout-container">
        <div className="checkout-content">
          <h1 className="checkout-title">{exchangeMode ? 'Exchange Checkout' : 'Checkout'}</h1>

          <div className="checkout-grid">
            {/* Left Column - Form */}
            <div className="checkout-form-section">
              <form onSubmit={handleSubmit}>
                {!exchangeMode ? (
                  <>
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
                        <label className="payment-option">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span className="payment-label">
                            <strong>Card Payment</strong>
                            <small>Pay securely with your card</small>
                          </span>
                        </label>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-section">
                      <h2 className="section-title">Book Exchange</h2>
                      <div className="payment-options">
                        <label className="payment-option">
                          <input type="radio" checked readOnly />
                          <span className="payment-label">
                            <strong>Book Exchange</strong>
                            <small>This exchange request will be sent to the seller for approval.</small>
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="form-section">
                      <h2 className="section-title">Choose Your Offered Book</h2>
                      <div className="form-group">
                        <label htmlFor="offeredBook">Select a book from your listings</label>
                        <select
                          id="offeredBook"
                          value={exchangeForm.offeredBookId}
                          onChange={(e) => setExchangeForm((currentForm) => ({ ...currentForm, offeredBookId: e.target.value }))}
                        >
                          <option value="">Choose your book</option>
                          {myBooks.map((book) => (
                            <option key={book._id} value={book._id}>
                              {book.title} by {book.author}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-section">
                      <h2 className="section-title">Exchange Details</h2>
                      <div className="form-group">
                        <label htmlFor="exchangeDetails">Tell the seller about your offer</label>
                        <textarea
                          id="exchangeDetails"
                          value={exchangeForm.details}
                          onChange={(e) => setExchangeForm((currentForm) => ({ ...currentForm, details: e.target.value }))}
                          placeholder="Condition, notes, pickup ideas, or any exchange details..."
                          rows="5"
                        />
                      </div>
                    </div>
                  </>
                )}

                {error && <p className="error-message">{error}</p>}

                {/* ✅ FIXED: StripePayment used directly inside Elements (no nested Elements) */}
                {paymentMethod === 'card' && !exchangeMode && (
                  <StripePayment
                    amount={totalAmount}
                    onPaymentSuccess={(paymentIntentId) => {
                      handleStripeOrderSubmit(paymentIntentId);
                    }}
                    onPaymentError={(msg) => setError(msg)}
                  />
                )}

                {/* ✅ Only show submit button for cash on delivery or exchange mode */}
                {(paymentMethod !== 'card' || exchangeMode) && (
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Processing...' : exchangeMode ? 'Send Exchange Request' : 'Complete Order'}
                  </button>
                )}
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <div className="order-summary-section">
              <h2 className="summary-title">{exchangeMode ? 'Exchange Summary' : 'Order Summary'}</h2>

              <div className="order-items">
                {cart?.items?.map(item => (
                  <div key={item.book._id} className="order-item">
                    <img src={getImageUrl(item.book.images?.[0])} alt={item.book.title} />
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
                {!exchangeMode ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div className="price-row">
                      <span>Requested Book:</span>
                      <span>{cart?.requestedBook?.title || cart?.items?.[0]?.book?.title}</span>
                    </div>
                    <div className="price-row">
                      <span>Your Offered Book:</span>
                      <span>{offeredBook?.title || 'Not selected yet'}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="summary-divider"></div>

              <div className="price-row total">
                <span>{exchangeMode ? 'Exchange Type:' : 'Total Amount:'}</span>
                <span>{exchangeMode ? 'Book Exchange' : `৳ ${totalAmount.toFixed(2)}`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
};

export default Checkout;