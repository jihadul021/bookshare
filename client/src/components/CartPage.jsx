import { useState, useEffect } from 'react'
import api from '../api'

export default function CartPage({ token, onBackHome, onRequireLogin }) {
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [totalPrice, setTotalPrice] = useState(0)

  if (!token) {
    onRequireLogin()
    return null
  }

  useEffect(() => {
    fetchCart()
  }, [token])

  useEffect(() => {
    calculateTotal()
  }, [selectedItems, cartItems])

  const fetchCart = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await api.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCartItems(response.data.items || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotal = () => {
    let total = 0
    selectedItems.forEach(itemId => {
      const item = cartItems.find(i => i._id === itemId)
      if (item && item.book) {
        total += item.book.price * item.quantity
      }
    })
    setTotalPrice(total)
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
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(cartItems.map(item => item._id)))
    }
  }

  const handleRemoveFromCart = async (bookId) => {
    try {
      setIsLoading(true)
      await api.post(
        '/api/cart/remove',
        { bookId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchCart()
      setSelectedItems(new Set())
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateQuantity = async (bookId, newQuantity) => {
    if (newQuantity < 1) return
    try {
      await api.put(
        '/api/cart/update',
        { bookId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchCart()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update cart')
    }
  }

  const handleProceedToBuy = () => {
    if (selectedItems.size === 0) {
      setError('Please select at least one book to proceed')
      return
    }
    // Can be integrated with checkout later
    alert(`Proceeding to buy ${selectedItems.size} item(s) for ৳${totalPrice}`)
  }

  if (isLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
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
          <h1 className="text-4xl font-bold text-gray-900">My Cart</h1>
          <p className="text-gray-600 mt-2">{cartItems.length} item(s) in cart</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Books */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600">Start adding books to your cart!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select All */}
                <div className="bg-white rounded-lg p-4 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                    onChange={handleSelectAll}
                    className="w-5 h-5 text-orange-500 rounded"
                  />
                  <span className="ml-3 font-semibold text-gray-700">
                    Select All ({selectedItems.size}/{cartItems.length})
                  </span>
                </div>

                {/* Cart Items */}
                {cartItems.map((item) => (
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
                        <p className="text-gray-600 text-sm mb-3">by {item.book?.author}</p>
                        <div className="flex items-center gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Price</p>
                            <p className="text-xl font-bold text-orange-600">৳{item.book?.price}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Quantity</p>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleUpdateQuantity(item.book._id, item.quantity - 1)}
                                className="px-3 py-1 text-gray-600 hover:text-gray-900"
                              >
                                −
                              </button>
                              <span className="px-4 py-1 font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.book._id, item.quantity + 1)}
                                className="px-3 py-1 text-gray-600 hover:text-gray-900"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Subtotal</p>
                            <p className="text-lg font-bold text-gray-900">৳{item.book?.price * item.quantity}</p>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="flex flex-col items-end justify-start">
                        <button
                          onClick={() => handleRemoveFromCart(item.book._id)}
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
          {cartItems.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">৳{totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">৳0</span>
                  </div>
                </div>

                <div className="flex justify-between mb-6 text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-orange-600">৳{totalPrice}</span>
                </div>

                <button
                  onClick={handleProceedToBuy}
                  disabled={selectedItems.size === 0 || isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-xl transition-colors mb-3"
                >
                  Proceed to Buy ({selectedItems.size})
                </button>

                <button
                  onClick={onBackHome}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Continue Shopping
                </button>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Select books you want to buy before proceeding
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
