import { useEffect, useState } from 'react';
import { requestPasswordResetOtp, resetPasswordWithOtp } from '../api';

function ForgotPasswordPage({ email: initialEmail = '', onBackToLogin }) {
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await requestPasswordResetOtp(email);
      setOtpRequested(true);
      setSuccess(response.data.message || 'A BookShare password reset OTP has been sent.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !otp || !password || !confirmPassword) {
      setError('Please complete all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await resetPasswordWithOtp(email, otp, password);
      setSuccess(response.data.message || 'Your BookShare password has been reset.');
      setTimeout(() => onBackToLogin?.(email), 900);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative bg-gray-50 border-t border-gray-200">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-orange-50"></div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="max-w-xl">
            <p className="text-orange-500 font-semibold tracking-wide uppercase text-sm mb-4">BookShare password reset</p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 mb-6">
              Reset your password with a BookShare OTP
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Request a one-time password by email, then enter it with your new password to regain access.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Forgot password</h2>
              <p className="text-gray-500 mt-1 text-sm">BookShare will email you a 6-digit OTP.</p>
            </div>

            <form onSubmit={otpRequested ? handleResetPassword : handleRequestOtp} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {otpRequested && (
                <>
                  <div>
                    <label htmlFor="forgot-otp" className="block text-sm font-medium text-gray-700 mb-2">
                      OTP
                    </label>
                    <input
                      id="forgot-otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 tracking-[0.35em] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                        New password
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="At least 6 chars"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm password
                      </label>
                      <input
                        id="confirm-new-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Repeat password"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </>
              )}

              {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
              {success && <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                {isSubmitting ? (otpRequested ? 'Resetting password...' : 'Sending OTP...') : (otpRequested ? 'Reset Password' : 'Send BookShare OTP')}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between text-sm">
              {otpRequested && (
                <button onClick={handleRequestOtp} className="text-orange-600 font-semibold hover:text-orange-700 transition-colors">
                  Send a new OTP
                </button>
              )}
              <button onClick={() => onBackToLogin?.(email)} className="text-gray-600 hover:text-gray-900 transition-colors ml-auto">
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ForgotPasswordPage;
