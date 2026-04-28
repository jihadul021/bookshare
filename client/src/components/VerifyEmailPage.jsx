import { useEffect, useState } from 'react';
import { resendVerificationOtp, verifyEmailOtp } from '../api';

function VerifyEmailPage({ email: initialEmail = '', onBackHome, onSwitchToLogin, onVerificationSuccess }) {
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !otp) {
      setError('Please enter both your email and OTP.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await verifyEmailOtp(email, otp);
      setSuccess(response.data.message || 'Your BookShare email has been verified.');
      setTimeout(() => onVerificationSuccess?.(email), 900);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email first.');
      return;
    }

    try {
      setIsResending(true);
      const response = await resendVerificationOtp(email);
      setSuccess(response.data.message || 'A new BookShare OTP has been sent.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <section className="relative bg-orange-50 border-t border-orange-100">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50"></div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="max-w-xl">
            <p className="text-orange-500 font-semibold tracking-wide uppercase text-sm mb-4">BookShare verification</p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 mb-6">
              Check your email and verify your BookShare account
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              We sent a BookShare OTP to your inbox. Enter it here to activate your account before logging in.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Verify email</h2>
              <p className="text-gray-500 mt-1 text-sm">Use the BookShare OTP from your email.</p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label htmlFor="verify-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="verify-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="verify-otp" className="block text-sm font-medium text-gray-700 mb-2">
                  OTP
                </label>
                <input
                  id="verify-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 tracking-[0.35em] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
              {success && <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                {isSubmitting ? 'Verifying...' : 'Verify BookShare Account'}
              </button>
            </form>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
              <button onClick={handleResend} disabled={isResending} className="text-orange-600 font-semibold hover:text-orange-700 transition-colors">
                {isResending ? 'Sending OTP...' : 'Resend OTP'}
              </button>
              <button onClick={onSwitchToLogin} className="text-gray-600 hover:text-gray-900 transition-colors">
                Back to login
              </button>
            </div>

            <button onClick={onBackHome} className="mt-4 text-sm text-gray-500 hover:text-gray-800 transition-colors">
              Return home
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VerifyEmailPage;
