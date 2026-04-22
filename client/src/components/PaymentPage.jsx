import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const StripePayment = ({ amount, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState('');

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setProcessing(true);
    setCardError('');

    try {
      // 1. Get client secret from your backend
      const res = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('bookshareUser'))?.token}`
        },
        body: JSON.stringify({ amount })
      });

      const { clientSecret } = await res.json();

      // 2. Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)
        }
      });

      if (result.error) {
        setCardError(result.error.message);
        onPaymentError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        onPaymentSuccess(result.paymentIntent.id);
      }
    } catch (err) {
      setCardError('Payment failed. Please try again.');
      onPaymentError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="stripe-payment">
      <div className="card-element-wrapper">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#333',
                '::placeholder': { color: '#aaa' }
              }
            }
          }}
        />
      </div>
      {cardError && <p className="error-text">{cardError}</p>}
      <button
        type="button"
        className="submit-btn"
        onClick={handlePay}
        disabled={processing || !stripe}
      >
        {processing ? 'Processing...' : `Pay ৳ ${amount.toFixed(2)}`}
      </button>
    </div>
  );
};

export default StripePayment;