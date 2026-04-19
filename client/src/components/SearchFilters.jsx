import { useState } from 'react'

const CATEGORIES = [
  { id: 'fiction', label: 'Fiction' },
  { id: 'non-fiction', label: 'Non-Fiction' },
  { id: 'mystery', label: 'Mystery' },
  { id: 'romance', label: 'Romance' },
  { id: 'science', label: 'Science' },
  { id: 'technology', label: 'Technology' },
  { id: 'biography', label: 'Biography' },
  { id: 'history', label: 'History' },
  { id: 'self-development', label: 'Self-Development' },
  { id: 'education', label: 'Education' },
  { id: 'other', label: 'Other' },
]

const CONDITIONS = [
  { id: 'new', label: 'New' },
  { id: 'like new', label: 'Like New' },
  { id: 'good', label: 'Good' },
  { id: 'fair', label: 'Fair & Better' },
  { id: 'poor', label: 'Poor' },
]

function SearchFilters({ filters, onFiltersChange }) {
  const [showCategories, setShowCategories] = useState(true)
  const [showCondition, setShowCondition] = useState(true)
  const [showPrice, setShowPrice] = useState(true)
  const [showRating, setShowRating] = useState(true)
  const [showSort, setShowSort] = useState(true)

  const handleCategoryToggle = (categoryId) => {
    const updatedCategories = filters.category.includes(categoryId)
      ? filters.category.filter(c => c !== categoryId)
      : [...filters.category, categoryId]
    onFiltersChange({ ...filters, category: updatedCategories })
  }

  const handleConditionToggle = (conditionId) => {
    const updatedConditions = filters.condition.includes(conditionId)
      ? filters.condition.filter(c => c !== conditionId)
      : [...filters.condition, conditionId]
    onFiltersChange({ ...filters, condition: updatedConditions })
  }

  const handlePriceChange = (type, value) => {
    onFiltersChange({
      ...filters,
      [type === 'min' ? 'minPrice' : 'maxPrice']: value ? parseFloat(value) : null
    })
  }

  const handleLocationChange = (value) => {
    onFiltersChange({ ...filters, location: value })
  }

  const handleRatingChange = (value) => {
    onFiltersChange({ ...filters, minRating: value ? parseFloat(value) : null })
  }

  const handleSortChange = (value) => {
    onFiltersChange({ ...filters, sortBy: value })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      category: [],
      condition: [],
      minPrice: null,
      maxPrice: null,
      location: '',
      minRating: null,
      sortBy: 'newest'
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        <button
          onClick={handleClearFilters}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Sort */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => setShowSort(!showSort)}
          className="w-full flex justify-between items-center font-semibold text-gray-900 mb-3"
        >
          <span>Sort By</span>
          <span className={`transform transition-transform ${showSort ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {showSort && (
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="sort"
                value="newest"
                checked={filters.sortBy === 'newest'}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-4 h-4 text-orange-500 cursor-pointer"
              />
              <span className="ml-3 text-sm text-gray-700">Newest</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="sort"
                value="price-asc"
                checked={filters.sortBy === 'price-asc'}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-4 h-4 text-orange-500 cursor-pointer"
              />
              <span className="ml-3 text-sm text-gray-700">Price: Low to High</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="sort"
                value="price-desc"
                checked={filters.sortBy === 'price-desc'}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-4 h-4 text-orange-500 cursor-pointer"
              />
              <span className="ml-3 text-sm text-gray-700">Price: High to Low</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="sort"
                value="rating"
                checked={filters.sortBy === 'rating'}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-4 h-4 text-orange-500 cursor-pointer"
              />
              <span className="ml-3 text-sm text-gray-700">Highest Rated</span>
            </label>
          </div>
        )}
      </div>

      {/* Category */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="w-full flex justify-between items-center font-semibold text-gray-900 mb-3"
        >
          <span>Category</span>
          <span className={`transform transition-transform ${showCategories ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {showCategories && (
          <div className="space-y-2">
            {CATEGORIES.map((cat) => (
              <label key={cat.id} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.category.includes(cat.id)}
                  onChange={() => handleCategoryToggle(cat.id)}
                  className="w-4 h-4 text-orange-500 rounded cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">{cat.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Condition */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => setShowCondition(!showCondition)}
          className="w-full flex justify-between items-center font-semibold text-gray-900 mb-3"
        >
          <span>Condition</span>
          <span className={`transform transition-transform ${showCondition ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {showCondition && (
          <div className="space-y-2">
            {CONDITIONS.map((cond) => (
              <label key={cond.id} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.condition.includes(cond.id)}
                  onChange={() => handleConditionToggle(cond.id)}
                  className="w-4 h-4 text-orange-500 rounded cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">{cond.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => setShowPrice(!showPrice)}
          className="w-full flex justify-between items-center font-semibold text-gray-900 mb-3"
        >
          <span>Price Range</span>
          <span className={`transform transition-transform ${showPrice ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {showPrice && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Minimum Price (৳)
              </label>
              <input
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Maximum Price (৳)
              </label>
              <input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                placeholder="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Location */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <label className="text-sm font-semibold text-gray-900 mb-2 block">Location</label>
        <input
          type="text"
          value={filters.location}
          onChange={(e) => handleLocationChange(e.target.value)}
          placeholder="Search location..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
        />
      </div>

      {/* Rating */}
      <div>
        <button
          onClick={() => setShowRating(!showRating)}
          className="w-full flex justify-between items-center font-semibold text-gray-900 mb-3"
        >
          <span>Minimum Rating</span>
          <span className={`transform transition-transform ${showRating ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {showRating && (
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={filters.minRating === rating}
                  onChange={(e) => handleRatingChange(e.target.value)}
                  className="w-4 h-4 text-orange-500 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">
                  {rating} <span className="text-amber-400">★</span> & up
                </span>
              </label>
            ))}
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="rating"
                value=""
                checked={filters.minRating === null}
                onChange={() => handleRatingChange('')}
                className="w-4 h-4 text-orange-500 cursor-pointer"
              />
              <span className="ml-3 text-sm text-gray-700">All Ratings</span>
            </label>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchFilters
