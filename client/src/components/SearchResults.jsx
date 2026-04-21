import { useState, useEffect } from 'react'
import { addToCart, addToWishlist, getCart, getWishlist, removeFromCart, removeFromWishlist, searchBooks } from '../api'
import SearchFilters from './SearchFilters'
import getImageUrl from '../utils/getImageUrl'

const DEFAULT_FILTERS = {
  category: [],
  condition: [],
  minPrice: null,
  maxPrice: null,
  location: '',
  minRating: null,
  sortBy: 'newest'
}

function SearchResults({ searchQuery, initialFilters = DEFAULT_FILTERS, onBack, token, onItemClick }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalBooks, setTotalBooks] = useState(0)
  const [cartItems, setCartItems] = useState([])
  const [wishlistItems, setWishlistItems] = useState([])
  const [showCartAdded, setShowCartAdded] = useState({})

  const [filters, setFilters] = useState(initialFilters)

  useEffect(() => {
    setFilters({ ...DEFAULT_FILTERS, ...initialFilters })
  }, [initialFilters])

  // Fetch cart and wishlist items
  useEffect(() => {
    if (token) {
      fetchCartAndWishlist()
    }
  }, [token])

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

  // Fetch search results
  useEffect(() => {
    fetchSearchResults()
  }, [searchQuery, filters])

  const fetchSearchResults = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        query: searchQuery,
        page: 1,
        limit: 1000,
        sortBy: filters.sortBy
      }

      if (filters.category.length > 0) params.category = filters.category
      if (filters.condition.length > 0) params.condition = filters.condition
      if (filters.minPrice !== null) params.minPrice = filters.minPrice
      if (filters.maxPrice !== null) params.maxPrice = filters.maxPrice
      if (filters.location) params.location = filters.location
      if (filters.minRating !== null) params.minRating = filters.minRating

      const response = await searchBooks(params)
      setBooks(response.data.books)
      setTotalBooks(response.data.pagination.totalBooks)
    } catch (err) {
      setError('Failed to fetch search results')
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
        setCartItems((prev) => prev.filter((id) => id !== bookId))
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Title */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium mb-4"
          >
            <span>←</span>
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchQuery?.trim() ? `Search Results for "${searchQuery}"` : 'All Available Books'}
          </h1>
          <p className="text-gray-600">
            Found {totalBooks} book{totalBooks !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            ) : books.length === 0 ? (
              <div className="bg-gray-100 rounded-lg p-12 text-center">
                <p className="text-gray-600 text-lg font-medium">No books found matching your search.</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <div className="relative aspect-[9/16] overflow-hidden bg-gray-100">
                        {book.images && book.images.length > 0 ? (
                          <img
                            src={getImageUrl(book.images[0])}
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
                        <h3 className="font-bold text-gray-900 leading-tight mb-2 group-hover:text-orange-600 transition-colors">
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
                          <p>Category: <span>{Array.isArray(book.category) ? book.category.join(', ') : book.category}</span></p>
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
        </div>
      </div>
    </div>
  )
}

export default SearchResults
