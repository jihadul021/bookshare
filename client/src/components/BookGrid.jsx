import { useState, useEffect } from 'react'
import api from '../api'
import getImageUrl from '../utils/getImageUrl'

function ItemCard({ item, onItemClick, token, onAddToCart, onAddToWishlist, isInCart, isInWishlist }) {
  const [showCartAdded, setShowCartAdded] = useState(false)

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    if (!token) {
      alert('Please login to add to cart')
      return
    }
    const wasInCart = isInCart
    const success = await onAddToCart(item._id)
    if (success && !wasInCart) {
      setShowCartAdded(true)
      setTimeout(() => setShowCartAdded(false), 2000)
    }
  }

  const handleAddToWishlist = async (e) => {
    e.stopPropagation()
    if (!token) {
      alert('Please login to add to wishlist')
      return
    }
    await onAddToWishlist(item._id)
  }

  const ratingValue = item.rating || 0
  const reviewCount = item.numReviews || 0

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
      onClick={() => onItemClick(item)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {item.images && item.images.length > 0 ? (
          <img
            src={getImageUrl(item.images[0])}
            alt={item.title}
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
        <h3 className="font-bold text-gray-900 leading-tight mb-2 group-hover:text-orange-600 transition-colors">
          {item.title}
        </h3>
        <p className="text-gray-500 text-sm mb-3">by {item.author}</p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            <span className="text-amber-400">★</span>
            <span className="font-semibold text-gray-900 text-sm ml-1">{ratingValue.toFixed(1)}</span>
          </div>
          <span className="text-gray-400 text-xs">({reviewCount})</span>
        </div>

        {/* Details */}
        <div className="text-sm text-gray-600 mb-4 flex-grow">
          <p className="mb-1">📍 {item.location}</p>
          <p>Condition: <span className="capitalize">{item.condition}</span></p>
          <p>Category: <span>{Array.isArray(item.category) ? item.category.join(', ') : item.category}</span></p>
        </div>

        {/* Price */}
        <div className="mb-4 border-t border-gray-100 pt-4">
          <p className="text-2xl font-bold text-orange-600">৳{item.price}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
              showCartAdded
                ? 'bg-green-500 text-white'
                : isInCart
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                showCartAdded
                  ? "M5 13l4 4L19 7"
                  : isInCart
                  ? "M6 18L18 6M6 6l12 12"
                  : "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8m10 0l2 8m-12 0h12"
              } />
            </svg>
            {showCartAdded ? 'Added!' : isInCart ? 'Remove' : 'Cart'}
          </button>
          <button
            onClick={handleAddToWishlist}
            className={`flex items-center justify-center py-2 px-3 rounded-lg font-semibold transition-all ${
              isInWishlist
                ? 'bg-red-500 text-white'
                : 'border-2 border-gray-300 text-gray-600 hover:border-red-400'
            }`}
          >
            <svg className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function BookGrid({ activeCategory, onItemClick, token, onShowCart, onShowWishlist, onSeeAll }) {
  const [books, setBooks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    setPage(1)
    setBooks([])
    setHasMore(true)
  }, [activeCategory])

  useEffect(() => {
    if (page === 1) {
      fetchBooks()
    } else {
      appendBooks()
    }
  }, [page])

  useEffect(() => {
    if (token) {
      fetchUserCart()
      fetchUserWishlist()
    }
  }, [token])

  const fetchBooks = async () => {
    try {
      setIsLoading(true)
      setError('')
      const params = { page: 1, limit: 10 }
      if (activeCategory && activeCategory !== 'all') {
        params.category = activeCategory
      }
      const response = await api.get('/api/books', { params })
      setBooks(response.data.books || [])
      setHasMore(response.data.pagination.hasMore)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load books')
    } finally {
      setIsLoading(false)
    }
  }

  const appendBooks = async () => {
    try {
      setIsLoading(true)
      const params = { page, limit: 10 }
      if (activeCategory && activeCategory !== 'all') {
        params.category = activeCategory
      }
      const response = await api.get('/api/books', { params })
      setBooks(prev => [...prev, ...(response.data.books || [])])
      setHasMore(response.data.pagination.hasMore)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load more books')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserCart = async () => {
    try {
      const response = await api.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCart(response.data.items || [])
    } catch (err) {
      console.error('Failed to fetch cart:', err)
    }
  }

  const fetchUserWishlist = async () => {
    try {
      const response = await api.get('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWishlist(response.data.books || [])
    } catch (err) {
      console.error('Failed to fetch wishlist:', err)
    }
  }

  const handleAddToCart = async (bookId) => {
    if (!token) {
      alert('Please login to add to cart')
      return
    }

    try {
      const isInCart = cart.some(item => item.book._id === bookId)
      if (isInCart) {
        await api.post(
          '/api/cart/remove',
          { bookId },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        await api.post(
          '/api/cart/add',
          { bookId, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      fetchUserCart()
      return true
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update cart')
      return false
    }
  }

  const handleAddToWishlist = async (bookId) => {
    if (!token) {
      alert('Please login to add to wishlist')
      return
    }

    try {
      const isAlreadyInWishlist = wishlist.some(item => item.book._id === bookId)
      if (isAlreadyInWishlist) {
        await api.post(
          '/api/wishlist/remove',
          { bookId },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        await api.post(
          '/api/wishlist/add',
          { bookId },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      fetchUserWishlist()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update wishlist')
    }
  }

  const isBookInCart = (bookId) => cart.some(item => item.book._id === bookId)
  const isBookInWishlist = (bookId) => wishlist.some(item => item.book._id === bookId)

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Books available near you</h2>
        <p className="text-gray-500 mt-1">Exchange, buy, or donate books in your community</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {books.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No books available</p>
        </div>
      ) : (
        <>
          {/* Books Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {books.map(book => (
              <ItemCard
                key={book._id}
                item={book}
                onItemClick={onItemClick}
                token={token}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                isInCart={isBookInCart(book._id)}
                isInWishlist={isBookInWishlist(book._id)}
              />
            ))}
          </div>

          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            {hasMore && (
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-xl transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    See More Books
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </>
                )}
              </button>
            )}
            <button
              onClick={onSeeAll}
              className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-bold py-3 px-8 rounded-xl transition-colors"
            >
              See All
            </button>
          </div>
        </>
      )}
    </section>
  )
}

export default BookGrid
