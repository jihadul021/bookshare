import { useState } from 'react';
import { createCheckoutSession } from '../api';

const StripePayment = ({ amount, onBeforeRedirect, onPaymentError }) => {
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    setProcessing(true);

    try {
      const preparedCheckout = await onBeforeRedirect?.();
      if (!preparedCheckout) {
        setProcessing(false);
        return;
      }

      const baseUrl = window.location.origin;
      const response = await createCheckoutSession({
        amount,
        successUrl: `${baseUrl}/`,
        cancelUrl: `${baseUrl}/`
      });

      if (!response.data?.url) {
        throw new Error('Stripe checkout URL was not returned');
      }

      window.location.href = response.data.url;
    } catch (err) {
      onPaymentError?.(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="stripe-payment">
      <button
        type="button"
        className="submit-btn"
        onClick={handlePay}
        disabled={processing}
      >
        {processing ? 'Redirecting to Stripe...' : `Pay ৳ ${amount.toFixed(2)} by Card`}
      </button>
    </div>
  );
};

export default StripePayment;
