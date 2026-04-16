import { useState, useEffect } from 'react'
import api from '../api'

export default function WishlistPage({ token, onBackHome, onRequireLogin }) {
  const [wishlistItems, setWishlistItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedItems, setSelectedItems] = useState(new Set())

  if (!token) {
    onRequireLogin()
    return null
  }

  useEffect(() => {
    fetchWishlist()
  }, [token])

  const fetchWishlist = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await api.get('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWishlistItems(response.data.books || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load wishlist')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedItems.size === wishlistItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(wishlistItems.map(item => item._id)))
    }
  }

  const handleRemoveFromWishlist = async (bookId) => {
    try {
      setIsLoading(true)
      await api.post(
        '/api/wishlist/remove',
        { bookId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchWishlist()
      setSelectedItems(new Set())
      setSuccess('Removed from wishlist')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = async (bookId) => {
    try {
      await api.post(
        '/api/cart/add',
        { bookId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess('Added to cart!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to cart')
    }
  }

  const handleAddSelectedToCart = async () => {
    if (selectedItems.size === 0) {
      setError('Please select books to add to cart')
      return
    }

    try {
      setIsLoading(true)
      for (let itemId of selectedItems) {
        const item = wishlistItems.find(i => i._id === itemId)
        if (item && item.book) {
          await api.post(
            '/api/cart/add',
            { bookId: item.book._id, quantity: 1 },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        }
      }
      setSuccess(`Added ${selectedItems.size} item(s) to cart!`)
      setSelectedItems(new Set())
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to cart')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBackHome}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Shopping
          </button>
          <h1 className="text-4xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">{wishlistItems.length} item(s) in wishlist</p>
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
          {/* Left Column - Wishlist Items */}
          <div className="lg:col-span-2">
            {wishlistItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-600">Start adding books to your wishlist!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select All */}
                <div className="bg-white rounded-lg p-4 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === wishlistItems.length && wishlistItems.length > 0}
                    onChange={handleSelectAll}
                    className="w-5 h-5 text-orange-500 rounded"
                  />
                  <span className="ml-3 font-semibold text-gray-700">
                    Select All ({selectedItems.size}/{wishlistItems.length})
                  </span>
                </div>

                {/* Wishlist Items */}
                {wishlistItems.map((item) => (
                  <div key={item._id} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex gap-6">
                      {/* Checkbox */}
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item._id)}
                          onChange={() => handleSelectItem(item._id)}
                          className="w-5 h-5 text-orange-500 rounded mt-2"
                        />
                      </div>

                      {/* Book Image */}
                      <div className="w-24 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.book?.images && item.book.images.length > 0 ? (
                          <img
                            src={item.book.images[0]}
                            alt={item.book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Book Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{item.book?.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">by {item.book?.author}</p>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Price</p>
                            <p className="text-xl font-bold text-orange-600">৳{item.book?.price}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Condition</p>
                            <p className="text-gray-700 capitalize">{item.book?.condition}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Location</p>
                            <p className="text-gray-700">{item.book?.location}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 items-end justify-start">
                        <button
                          onClick={() => handleAddToCart(item.book._id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => handleRemoveFromWishlist(item.book._id)}
                          className="text-red-500 hover:text-red-700 font-semibold text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          {wishlistItems.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Wishlist Summary</h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items</span>
                    <span className="font-semibold">{wishlistItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selected Items</span>
                    <span className="font-semibold">{selectedItems.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Value</span>
                    <span className="font-semibold text-orange-600">
                      ৳{wishlistItems.reduce((sum, item) => sum + (item.book?.price || 0), 0)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAddSelectedToCart}
                  disabled={selectedItems.size === 0 || isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-xl transition-colors mb-3"
                >
                  Add Selected to Cart ({selectedItems.size})
                </button>

                <button
                  onClick={onBackHome}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Continue Shopping
                </button>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Check items and add them to cart to proceed with checkout
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
