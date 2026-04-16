import { useState, useEffect } from 'react'
import api from '../api'

function ProductDetails({ item, onBack, token }) {
  const [isInCart, setIsInCart] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Check if item is in cart/wishlist on mount
  useEffect(() => {
    if (token && item) {
      checkCartAndWishlist()
    }
  }, [token, item?._id])

  const checkCartAndWishlist = async () => {
    try {
      const [cartRes, wishlistRes] = await Promise.all([
        api.get('/api/cart', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/api/wishlist', { headers: { Authorization: `Bearer ${token}` } })
      ])
      const inCart = cartRes.data.items?.some(cartItem => cartItem.book._id === item._id)
      const inWishlist = wishlistRes.data.books?.some(wishItem => wishItem.book._id === item._id)
      setIsInCart(inCart || false)
      setIsInWishlist(inWishlist || false)
    } catch (err) {
      console.error('Failed to check cart/wishlist:', err)
    }
  }

  if (!item) return null

  const seller = item.seller || {}
  const rating = item.rating || 0
  const numReviews = item.numReviews || 0
  const isVerified = seller.isverified || false

  const handleAddToCart = async () => {
    if (!token) {
      alert('Please login to add to cart')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      if (isInCart) {
        await api.post(
          '/api/cart/remove',
          { bookId: item._id },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setIsInCart(false)
      } else {
        await api.post(
          '/api/cart/add',
          { bookId: item._id, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setIsInCart(true)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update cart')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (!token) {
      alert('Please login to add to wishlist')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      if (isInWishlist) {
        await api.post(
          '/api/wishlist/remove',
          { bookId: item._id },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        await api.post(
          '/api/wishlist/add',
          { bookId: item._id },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      setIsInWishlist(!isInWishlist)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update wishlist')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        ← Back to books
      </button>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10">

        {/* LEFT COLUMN */}
        <div className="w-full lg:w-2/3">

          {/* Image */}
          <div className="rounded-2xl overflow-hidden aspect-[16/9] mb-8 bg-gray-200">
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Title & Meta */}
          <div className="mb-8 border-b border-gray-200 pb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
              {item.title}
            </h1>
            <p className="text-gray-500 text-sm mb-3">by {item.author}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center">
                <span className="text-amber-400 mr-1">★</span>
                <span className="font-bold text-gray-900">{rating.toFixed(1)}</span>
                <span className="text-gray-500 ml-1">({numReviews} reviews)</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600">Location: {item.location}</span>
              <span className="text-gray-300">•</span>
              {isVerified ? (
                <span className="text-green-600 font-medium">✓ Verified seller</span>
              ) : (
                <span className="text-yellow-600 font-medium">⚠ Unverified seller</span>
              )}
            </div>
          </div>

          {/* Add to Cart & Wishlist */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 transition-none ${
                isInCart
                  ? 'bg-red-100 hover:bg-red-200 text-red-600'
                  : 'bg-black hover:bg-gray-900 text-white'
              } disabled:bg-gray-400 font-semibold py-3 px-6 rounded-xl transition-colors shadow-md`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                  isInCart
                    ? "M6 18L18 6M6 6l12 12"
                    : "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8m10 0l2 8m-12 0h12"
                } />
              </svg>
              {isInCart ? 'Remove from Cart' : 'Add to Cart'}
            </button>
            <button
              onClick={handleAddToWishlist}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 transition-none ${
                isInWishlist
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'border-2 border-black text-black hover:bg-gray-100'
              } disabled:bg-gray-400 disabled:border-gray-400 font-semibold py-3 px-6 rounded-xl`}
            >
              <svg
                className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`}
                fill={isInWishlist ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Seller Info */}
          <div className="flex items-center justify-between bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xl border border-orange-200 mr-4">
                {seller.name?.charAt(0) || 'S'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{seller.name || 'Seller'}</h3>
                <p className="text-gray-500 text-sm">
                  {isVerified ? '✓ Verified seller' : 'Unverified'}
                </p>
              </div>
            </div>
            <button className="hidden sm:block border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-6 rounded-xl transition-colors">
              Contact Seller
            </button>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Book Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start">
                <span className="text-green-500 mr-3">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Condition</p>
                  <p className="text-gray-600 capitalize">{item.condition}</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-3">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Categories</p>
                  <p className="text-gray-600">{Array.isArray(item.category) ? item.category.join(', ') : item.category}</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-3">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Location</p>
                  <p className="text-gray-600">{item.location}</p>
                </div>
              </div>
              {item.exchangeAvailable && (
                <div className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <p className="text-green-700 font-semibold">Available for exchange</p>
                </div>
              )}
              {item.exchangeAvailable && (
                <div className="flex items-start">
                  <span className="text-green-500 mr-3">✓</span>
                  <div>
                    <p className="font-semibold text-gray-900">Exchange</p>
                    <p className="text-gray-600">Available for exchange</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN — Purchase Card */}
        <div className="w-full lg:w-1/3">
          <div className="sticky top-24 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl">

            {/* Price */}
            <div className="flex items-end mb-6">
              <span className="text-2xl font-extrabold text-gray-900">৳</span>
              <span className="text-4xl font-bold text-orange-600 ml-1">{item.price}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                disabled
                className="flex-1 bg-orange-500 text-white opacity-90 cursor-not-allowed font-bold py-4 px-6 rounded-xl transition-colors text-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Buy Now
              </button>
            </div>

            {item.exchangeAvailable && (
              <button
                className="w-full mt-3 bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-bold py-4 px-6 rounded-xl transition-colors text-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Request Exchange
              </button>
            )}

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Add to cart to proceed with purchase
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default ProductDetails