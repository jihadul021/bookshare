import { useEffect, useState } from 'react'
import { login } from '../api'

function LoginPage({ onSwitchToRegister, onBackHome, onAuthSuccess, onForgotPassword, onRequireVerification, initialEmail = '' }) {
  const [formData, setFormData] = useState({
    email: initialEmail,
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormData((current) => ({ ...current, email: initialEmail || '' }))
  }, [initialEmail])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await login(formData.email, formData.password)
      localStorage.setItem('bookshareUser', JSON.stringify(response.data))
      onAuthSuccess?.(response.data)
      setSuccess('Logged in successfully. Redirecting to home...')
      setTimeout(() => onBackHome(), 900)
    } catch (requestError) {
      const responseData = requestError.response?.data
      if (responseData?.requiresVerification) {
        setError(responseData.message || 'Please verify your BookShare email before logging in.')
        onRequireVerification?.(responseData.email || formData.email)
        return
      }

      setError(responseData?.message || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative bg-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2000&q=80"
          alt="Library shelves"
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/85 to-gray-900/70"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="max-w-xl">
            <p className="text-orange-400 font-semibold tracking-wide uppercase text-sm mb-4">Welcome back</p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              Continue your reading journey with <span className="text-orange-500">BookShare</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              Sign in to access exchanges, wishlists, and your personalized reading activity.
            </p>
          </div>

          <div className="bg-white text-gray-900 rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Log in</h2>
              <p className="text-gray-500 mt-1 text-sm">Use your BookShare account credentials.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onForgotPassword?.(formData.email)}
                  className="text-sm text-orange-600 font-semibold hover:text-orange-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                {isSubmitting ? 'Signing in...' : 'Log in'}
              </button>
            </form>

            <p className="text-sm text-gray-600 mt-5">
              New here?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-orange-600 font-semibold hover:text-orange-700 transition-colors"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
