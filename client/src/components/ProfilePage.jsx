import { useState, useEffect } from 'react'
import api from '../api'

export default function ProfilePage({
  token,
  initialUser,
  onBackHome,
  onRequireLogin,
  onProfileUpdated,
  onAddBook
}) {
  const [user, setUser] = useState(initialUser || {})
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [profilePicPreview, setProfilePicPreview] = useState(initialUser?.profilePicture || '')

  const [formData, setFormData] = useState({
    name: initialUser?.name || '',
    email: initialUser?.email || '',
    phone: initialUser?.phone || '',
    address: initialUser?.address || '',
    gender: initialUser?.gender || 'male',
    profilePicture: initialUser?.profilePicture || '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!token) {
      onRequireLogin()
    } else {
      fetchUserProfile()
    }
  }, [token])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(response.data)
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        gender: response.data.gender || 'male',
        profilePicture: response.data.profilePicture || '',
        password: '',
        confirmPassword: ''
      })
      setProfilePicPreview(response.data.profilePicture || '')
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicPreview(reader.result)
        setFormData(prev => ({
          ...prev,
          profilePicture: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    return true
  }

  const handleSaveProfile = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        profilePicture: formData.profilePicture
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      const response = await api.put('/api/auth/profile', updateData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setUser(response.data)
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }))
      setShowPasswordField(false)
      setError('')
      setSuccess('Profile updated successfully!')
      setIsEditing(false)

      // Update stored user data
      const updatedUser = { ...response.data, token }
      onProfileUpdated(updatedUser)

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      gender: user.gender || 'male',
      profilePicture: user.profilePicture || '',
      password: '',
      confirmPassword: ''
    })
    setProfilePicPreview(user.profilePicture || '')
    setShowPasswordField(false)
    setIsEditing(false)
    setError('')
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const profileInitial = formData.name?.trim()?.charAt(0)?.toUpperCase() || 'U'
  const hasProfilePicture = Boolean(profilePicPreview?.trim())

  if (isLoading && !user.name) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBackHome}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipPath="evenodd" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipPath="evenodd" />
            </svg>
            <span className="text-green-800">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                {hasProfilePicture ? (
                  <img
                    src={profilePicPreview}
                    alt={formData.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-orange-100 mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-4 border-4 border-orange-100 text-white text-3xl font-bold">
                    {profileInitial}
                  </div>
                )}
              </div>

              {/* User Name */}
              <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">
                {formData.name}
              </h1>
              <p className="text-center text-gray-500 mb-4 text-sm">Member</p>

              {/* Info Items */}
              <div className="space-y-3 mb-6 py-4 border-t border-b border-gray-200">
                <div className="flex items-start text-sm">
                  <span className="text-gray-500 min-w-fit mr-3">📧</span>
                  <span className="text-gray-700 break-all">{formData.email}</span>
                </div>
                <div className="flex items-start text-sm">
                  <span className="text-gray-500 mr-3">📱</span>
                  <span className="text-gray-700">{formData.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-start text-sm">
                  <span className="text-gray-500 mr-3">👤</span>
                  <span className="text-gray-700 capitalize">{formData.gender}</span>
                </div>
                <div className="flex items-start text-sm">
                  <span className="text-gray-500 mr-3">📍</span>
                  <span className="text-gray-700">{formData.address || 'Not provided'}</span>
                </div>

              </div>

              {/* Joining Date */}
              <div className="bg-orange-50 rounded-lg p-3 mb-6">
                <p className="text-xs text-gray-600 mb-1">Member Since</p>
                <p className="text-lg font-semibold text-orange-600">
                  {formatDate(user.joinDate)}
                </p>
              </div>

              {/* Edit Button */}
              {!isEditing ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={onAddBook}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add My Book
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                </div>
              )}
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2">
            {!isEditing ? (
              <>
                <div className="space-y-6">
                  {/* Statistics Card */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Statistics</h2>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600 mb-1">0</p>
                        <p className="text-sm text-gray-600">Books Listed</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-green-600 mb-1">0</p>
                        <p className="text-sm text-gray-600">Active Listings</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-purple-600 mb-1">0</p>
                        <p className="text-sm text-gray-600">Transactions</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Information */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Full Name</p>
                        <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Email Address</p>
                        <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Phone Number</p>
                        <p className="text-lg font-semibold text-gray-900">{user.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Gender</p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">{user.gender}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Address</p>
                        <p className="text-lg font-semibold text-gray-900">{user.address || 'Not provided'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-2">Account Status</p>
                        <p className="text-lg font-semibold text-green-600">Active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Edit Form */
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Edit Profile</h2>

                {/* Profile Picture Edit */}
                <div className="mb-8 flex flex-col items-center">
                  <div className="relative group">
                    <img
                      src={profilePicPreview || 'https://via.placeholder.com/150'}
                      alt="Preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-orange-100 shadow-md"
                    />
                    <label className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Click the icon to change photo</p>
                </div>

                {/* Name */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Phone */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Gender */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Address */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Enter your address"
                  />
                </div>

                {/* Password Section */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setShowPasswordField(!showPasswordField)}
                    className="text-orange-500 hover:text-orange-600 font-semibold text-sm transition-colors flex items-center"
                  >
                    <svg className={`w-4 h-4 mr-2 transition-transform ${showPasswordField ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                    Change Password
                  </button>
                </div>

                {showPasswordField && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Enter new password (min. 6 characters)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
