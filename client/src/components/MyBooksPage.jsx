import { useState, useEffect } from 'react'
import api from '../api'

export default function MyBooksPage({
  token,
  onBackHome,
  onRequireLogin
}) {
  const [books, setBooks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingBookId, setEditingBookId] = useState(null)
  const [editFormData, setEditFormData] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [editImages, setEditImages] = useState([])
  const [editImagePreviews, setEditImagePreviews] = useState([])

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

  useEffect(() => {
    fetchMyBooks()
  }, [token])

  const fetchMyBooks = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await api.get('/api/books/mybooks', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBooks(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your books')
    } finally {
      setIsLoading(false)
    }
  }

  const startEdit = (book) => {
    setEditingBookId(book._id)
    setEditFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price,
      condition: book.condition,
      category: book.category || [],
      exchangeAvailable: book.exchangeAvailable || false,
      location: book.location,
      stock: book.stock || 1
    })
    setEditImages(book.images || [])
    setEditImagePreviews(book.images || [])
  }

  const cancelEdit = () => {
    setEditingBookId(null)
    setEditFormData(null)
    setEditImages([])
    setEditImagePreviews([])
  }

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleEditCategoryToggle = (cat) => {
    setEditFormData(prev => {
      const currentCats = prev.category || []
      const isSelected = currentCats.includes(cat)
      const updatedCats = isSelected 
        ? currentCats.filter(c => c !== cat)
        : [...currentCats, cat]
      
      return { ...prev, category: updatedCats }
    })
  }

  const handleEditImageChange = (e) => {
    const files = Array.from(e.target.files)
    const newPreviews = []
    const newImages = []

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newImages.push(reader.result)
        newPreviews.push(reader.result)
        
        if (newPreviews.length === files.length) {
          setEditImages(prev => [...prev, ...newImages])
          setEditImagePreviews(prev => [...prev, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeEditImage = (index) => {
    setEditImages(prev => prev.filter((_, i) => i !== index))
    setEditImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const validateEditForm = () => {
    if (!editFormData.title.trim()) {
      setError('Title is required')
      return false
    }
    if (!editFormData.author.trim()) {
      setError('Author is required')
      return false
    }
    if (!editFormData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (!editFormData.category || editFormData.category.length === 0) {
      setError('Please select at least one category')
      return false
    }
    if (!editFormData.price || editFormData.price <= 0) {
      setError('Valid price is required')
      return false
    }
    if (!editFormData.location.trim()) {
      setError('Location is required')
      return false
    }
    return true
  }

  const handleSaveEdit = async () => {
    if (!validateEditForm()) return

    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      const updateData = {
        title: editFormData.title,
        author: editFormData.author,
        description: editFormData.description,
        price: parseFloat(editFormData.price),
        condition: editFormData.condition,
        category: editFormData.category,
        exchangeAvailable: editFormData.exchangeAvailable,
        location: editFormData.location,
        stock: parseInt(editFormData.stock) || 1,
        images: editImagePreviews
      }

      const response = await api.put(`/api/books/${editingBookId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Update the book in the list
      setBooks(prev => prev.map(b => b._id === editingBookId ? response.data : b))
      
      setSuccess('Book updated successfully!')
      setEditingBookId(null)
      setEditFormData(null)
      setEditImages([])
      setEditImagePreviews([])

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update book')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBook = async (bookId) => {
    try {
      setIsLoading(true)
      setError('')

      await api.delete(`/api/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setBooks(prev => prev.filter(b => b._id !== bookId))
      setSuccess('Book deleted successfully!')
      setDeleteConfirm(null)

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete book')
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isLoading && books.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your books...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-4xl font-bold text-gray-900">My Books</h1>
          <p className="text-gray-600 mt-2">Manage and edit your uploaded books</p>
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

        {/* Empty State */}
        {!isLoading && books.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No books yet</h3>
            <p className="text-gray-600">You haven't uploaded any books yet. Start by adding your first book!</p>
          </div>
        )}

        {/* Books Grid */}
        {!isLoading && books.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {books.map((book) => (
              <div key={book._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {editingBookId === book._id ? (
                  // EDIT MODE
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Book</h2>
                    
                    {/* Row 1: Title & Author */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Book Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={editFormData.title}
                          onChange={handleEditInputChange}
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
                          value={editFormData.author}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="Enter author name"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditInputChange}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                        placeholder="Describe the book, condition, any highlights, etc."
                      />
                    </div>

                    {/* Row 2: Price, Condition & Stock */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price (৳) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="price"
                          value={editFormData.price}
                          onChange={handleEditInputChange}
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
                          value={editFormData.condition}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        >
                          {conditions.map(cond => (
                            <option key={cond.value} value={cond.value}>{cond.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Stock Quantity *
                        </label>
                        <input
                          type="number"
                          name="stock"
                          value={editFormData.stock}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="Enter stock quantity"
                          min="1"
                        />
                      </div>
                    </div>

                    {/* Row 3: Category & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Categories * (Select multiple)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => handleEditCategoryToggle(cat)}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all capitalize ${
                                editFormData.category.includes(cat)
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
                          value={editFormData.location}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="City, Area or Full Address"
                        />
                      </div>
                    </div>

                    {/* Exchange Available */}
                    <div className="flex items-center p-4 bg-orange-50 rounded-lg border border-orange-200 mb-6">
                      <input
                        type="checkbox"
                        id="edit-exchange"
                        name="exchangeAvailable"
                        checked={editFormData.exchangeAvailable}
                        onChange={handleEditInputChange}
                        className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                      />
                      <label htmlFor="edit-exchange" className="ml-3 text-gray-700 font-semibold cursor-pointer">
                        Available for exchange (Optional)
                      </label>
                    </div>

                    {/* Image Upload */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Book Images
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors cursor-pointer bg-gray-50">
                        <label className="cursor-pointer block">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <p className="text-gray-700 font-semibold mb-1">Click to upload more images</p>
                          <p className="text-gray-500 text-sm">or drag and drop</p>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleEditImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Image Preview */}
                      {editImagePreviews.length > 0 && (
                        <div className="mt-6">
                          <p className="text-sm font-semibold text-gray-700 mb-4">
                            Images ({editImagePreviews.length})
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {editImagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeEditImage(index)}
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

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                      <button
                        onClick={handleSaveEdit}
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all disabled:bg-gray-400 flex items-center justify-center"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={isLoading}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // VIEW MODE
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Book Image */}
                      <div className="md:col-span-1">
                        {book.images && book.images.length > 0 ? (
                          <img
                            src={book.images[0]}
                            alt={book.title}
                            className="w-full h-64 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>

                      {/* Book Details */}
                      <div className="md:col-span-2">
                        <div className="mb-4">
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">{book.title}</h3>
                          <p className="text-gray-600">by {book.author}</p>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div>
                            <p className="text-sm text-gray-600 font-semibold">Description</p>
                            <p className="text-gray-700 mt-1">{book.description}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 font-semibold">Price</p>
                              <p className="text-lg text-orange-600 font-bold">৳{book.price}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 font-semibold">Condition</p>
                              <p className="text-gray-700 capitalize">{book.condition}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 font-semibold mb-2">Categories</p>
                            <div className="flex flex-wrap gap-2">
                              {book.category && (Array.isArray(book.category) ? book.category : [book.category]).map((cat) => (
                                <span key={cat} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm capitalize">
                                  {cat.replace('-', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 font-semibold">Location</p>
                            <p className="text-gray-700">{book.location}</p>
                          </div>

                          {book.exchangeAvailable && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-green-800 font-semibold">✓ Available for exchange</p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => startEdit(book)}
                            disabled={isLoading}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:bg-gray-400 flex items-center justify-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(book._id)}
                            disabled={isLoading}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:bg-gray-400 flex items-center justify-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Delete Confirmation Modal */}
                      {deleteConfirm === book._id && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Book?</h3>
                            <p className="text-gray-600 mb-6">Are you sure you want to delete "{book.title}"? This action cannot be undone.</p>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleDeleteBook(book._id)}
                                disabled={isLoading}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:bg-gray-400"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                disabled={isLoading}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition-colors disabled:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
