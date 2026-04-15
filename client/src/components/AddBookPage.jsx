import { useState } from 'react'
import api from '../api'

export default function AddBookPage({
  token,
  onBackHome,
  onBookAdded,
  onRequireLogin
}) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    condition: 'good',
    categories: [],
    exchangeAvailable: false,
    location: ''
  })

  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!token) {
    onRequireLogin()
    return null
  }

  const categories = [
    'fiction',
    'non-fiction',
    'mystery',
    'romance',
    'science',
    'technology',
    'biography',
    'history',
    'self-development',
    'education',
    'other'
  ]

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleCategoryToggle = (cat) => {
    setFormData(prev => {
      const currentCats = prev.categories || []
      const isSelected = currentCats.includes(cat)
      const updatedCats = isSelected 
        ? currentCats.filter(c => c !== cat)
        : [...currentCats, cat]
      
      return { ...prev, categories: updatedCats }
    })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const newPreviews = []
    const newImages = []

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newImages.push(reader.result)
        newPreviews.push(reader.result)
        
        if (newPreviews.length === files.length) {
          setImages(prev => [...prev, ...newImages])
          setImagePreviews(prev => [...prev, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required')
      return false
    }
    if (!formData.author.trim()) {
      setError('Author is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (!formData.categories || formData.categories.length === 0) {
      setError('Please select at least one category')
      return false
    }
    if (!formData.price || formData.price <= 0) {
      setError('Valid price is required')
      return false
    }
    if (!formData.location.trim()) {
      setError('Location is required')
      return false
    }
    // if (imagePreviews.length === 0) {
    //   setError('At least one image is required')
    //   return false
    // }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      const bookData = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        price: parseFloat(formData.price),
        condition: formData.condition,
        categories: formData.categories,
        exchangeAvailable: formData.exchangeAvailable,
        location: formData.location,
        images: imagePreviews
      }

      const response = await api.post('/api/books', bookData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setSuccess('Book added successfully!')
      setFormData({
        title: '',
        author: '',
        description: '',
        price: '',
        condition: 'good',
        categories: [],
        exchangeAvailable: false,
        location: ''
      })
      setImages([])
      setImagePreviews([])

      setTimeout(() => {
        if (onBookAdded) onBookAdded(response.data)
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add book. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBackHome}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Add Your Book</h1>
          <p className="text-gray-600 mt-2">Share your books and start earning!</p>
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

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Row 1: Title & Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Book Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter book title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter author name"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                placeholder="Describe the book, condition, any highlights, etc."
              />
            </div>

            {/* Row 2: Price & Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (৳) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter price"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  {conditions.map(cond => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Category & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Categories * (Select multiple)
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryToggle(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all capitalize ${
                        formData.categories.includes(cat)
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'bg-white border-gray-300 text-gray-600 hover:border-orange-400'
                      }`}
                    >
                      {cat.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="City, Area or Full Address"
                />
              </div>
            </div>

            {/* Exchange Available */}
            <div className="flex items-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <input
                type="checkbox"
                id="exchange"
                name="exchangeAvailable"
                checked={formData.exchangeAvailable}
                onChange={handleInputChange}
                className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
              />
              <label htmlFor="exchange" className="ml-3 text-gray-700 font-semibold cursor-pointer">
                Available for exchange (Optional)
              </label>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Book Images *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors cursor-pointer bg-gray-50">
                <label className="cursor-pointer block">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-gray-700 font-semibold mb-1">Click to upload images</p>
                  <p className="text-gray-500 text-sm">or drag and drop</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Preview */}
              {imagePreviews.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-700 mb-4">
                    Uploaded Images ({imagePreviews.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipPath="evenodd" />
                          </svg>
                        </button>
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all disabled:bg-gray-400 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Book
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onBackHome}
                disabled={isLoading}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Tips for a Great Listing</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-start">
              <span className="mr-3">✓</span>
              <span>Use clear, descriptive titles and add important details in the description</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">✓</span>
              <span>Upload high-quality images from different angles</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">✓</span>
              <span>Be honest about the book's condition</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">✓</span>
              <span>Set a competitive price to attract more buyers</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
