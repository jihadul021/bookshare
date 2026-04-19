import { useState, useEffect } from 'react'
import api from '../api'
import FloatingChat from './FloatingChat'
import { addToCart, addToWishlist, getCart, getWishlist, removeFromCart, removeFromWishlist } from '../api'

function SellerProfile({ sellerId, onBack, token, onShowCart, onShowWishlist, onItemClick }) {
  const [seller, setSeller] = useState(null)
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [wishlistItems, setWishlistItems] = useState([])
  const [showCartAdded, setShowCartAdded] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [showChatWindow, setShowChatWindow] = useState(false)

  // Fetch cart and wishlist items
  useEffect(() => {
    if (token) {
      fetchCartAndWishlist()
    }
  }, [token])

  // Fetch seller info and books
  useEffect(() => {
    fetchSellerData()
  }, [sellerId])

  const fetchCartAndWishlist = async () => {
    try {
      const [cartRes, wishlistRes] = await Promise.all([
        getCart(),
        getWishlist()
      ])
      setCartItems(cartRes.data.items?.map(item => item.book?._id || item.book) || [])
      setWishlistItems(wishlistRes.data.books?.map(item => item.book?._id || item.book) || [])
    } catch (err) {
      console.error('Failed to fetch cart/wishlist:', err)
    }
  }

  const fetchSellerData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.get(`/api/books/seller/${sellerId}?page=1&limit=12`)
      
      if (response.data.books.length > 0) {
        setSeller(response.data.books[0].seller)
      }
      setBooks(response.data.books)
      setCurrentPage(1)
    } catch (err) {
      setError('Failed to fetch seller information')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (bookId) => {
    if (!token) {
      alert('Please login to add to cart')
      return false
    }

    try {
      const isInCart = cartItems.includes(bookId)
      if (isInCart) {
        await removeFromCart(bookId)
        setCartItems((prev) => prev.filter(id => id !== bookId))
      } else {
        await addToCart(bookId, 1)
        setCartItems((prev) => [...prev, bookId])
      }
      setShowCartAdded({ ...showCartAdded, [bookId]: true })
      setTimeout(() => setShowCartAdded({ ...showCartAdded, [bookId]: false }), 2000)
      return true
    } catch (err) {
      console.error('Failed to add to cart:', err)
      return false
    }
  }

  const handleAddToWishlist = async (bookId) => {
    if (!token) {
      alert('Please login to add to wishlist')
      return
    }

    try {
      if (wishlistItems.includes(bookId)) {
        await removeFromWishlist(bookId)
        setWishlistItems((prev) => prev.filter(id => id !== bookId))
      } else {
        await addToWishlist(bookId)
        setWishlistItems((prev) => [...prev, bookId])
      }
    } catch (err) {
      console.error('Failed to update wishlist:', err)
    }
  }

  const getInitial = (name) => {
    return name?.trim()?.charAt(0)?.toUpperCase() || 'U'
  }

  const hasProfilePicture = seller?.profilePicture?.trim() && !seller?.profilePicture?.includes('google.com/url?')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium"
        >
          <span>←</span>
          Back
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Seller Profile Section */}
          {seller && (
            <div className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                  {/* Seller Avatar */}
                  <div className="flex-shrink-0">
                    {hasProfilePicture ? (
                      <img
                        src={seller.profilePicture}
                        alt={seller.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-orange-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-orange-100">
                        {getInitial(seller.name)}
                      </div>
                    )}
                  </div>

                  {/* Seller Info */}
                  <div className="flex-grow">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{seller.name}</h1>
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">★</span>
                        <span className="font-semibold text-gray-900">
                          {seller.rating || 'No ratings yet'}
                        </span>
                      </div>
                      {seller.isverified && (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-green-600 font-medium">Verified Seller</span>
                        </div>
                      )}

                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => setShowChatWindow(true)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <span>💬</span>
                        Chat with Seller
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Books Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Books by {seller?.name || 'This Seller'}
              </h2>
              <p className="text-gray-600">
                {books.length} book{books.length !== 1 ? 's' : ''} available
              </p>
            </div>

            {books.length === 0 ? (
              <div className="bg-gray-100 rounded-lg p-12 text-center">
                <p className="text-gray-600 text-lg font-medium">
                  This seller hasn't listed any books yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {books.map((book) => {
                  const isInCart = cartItems.includes(book._id)
                  const isInWishlist = wishlistItems.includes(book._id)
                  const isAdded = showCartAdded[book._id] || false

                  return (
                    <div
                      key={book._id}
                      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                      onClick={() => onItemClick(book)}
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        {book.images && book.images.length > 0 ? (
                          <img
                            src={book.images[0]}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-bold text-gray-900 leading-tight mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-3">by {book.author}</p>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            <span className="text-amber-400">★</span>
                            <span className="font-semibold text-gray-900 text-sm ml-1">
                              {(book.rating || 0).toFixed(1)}
                            </span>
                          </div>
                          <span className="text-gray-400 text-xs">({book.numReviews || 0})</span>
                        </div>

                        {/* Details */}
                        <div className="text-sm text-gray-600 mb-4 flex-grow">
                          <p className="mb-1">📍 {book.location}</p>
                          <p>Condition: <span className="capitalize">{book.condition}</span></p>
                        </div>

                        {/* Price */}
                        <div className="mb-4 border-t border-gray-100 pt-4">
                          <p className="text-2xl font-bold text-orange-600">৳{book.price}</p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddToCart(book._id)
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                              isAdded
                                ? 'bg-green-500 text-white'
                                : isInCart
                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                : 'bg-orange-500 text-white hover:bg-orange-600'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                                isAdded
                                  ? "M5 13l4 4L19 7"
                                  : isInCart
                                  ? "M6 18L18 6M6 6l12 12"
                                  : "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8m10 0l2 8m-12 0h12"
                              } />
                            </svg>
                            {isAdded ? 'Added' : isInCart ? 'Remove' : 'Add'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddToWishlist(book._id)
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                              isInWishlist
                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <svg className="w-4 h-4" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {isInWishlist ? 'Liked' : 'Like'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Floating Chat Window */}
      {showChatWindow && (
        <FloatingChat
          sellerId={seller._id}
          sellerName={seller.name}
          token={token}
          onClose={() => setShowChatWindow(false)}
        />
      )}
    </div>
  )
}

export default SellerProfile
