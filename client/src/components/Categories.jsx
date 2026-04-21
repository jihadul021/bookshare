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

function Categories({ activeCategory, setActiveCategory, onSelectFilter }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Browse By Category</h3>
        <div className="flex overflow-x-auto gap-4 pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory?.(cat.id)
                onSelectFilter?.({ type: 'category', value: cat.id })
              }}
              className={`whitespace-nowrap px-6 py-3 rounded-full border-2 font-medium transition-all ${
                activeCategory === cat.id
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Browse By Condition</h3>
        <div className="flex overflow-x-auto gap-4 pb-2">
          {CONDITIONS.map((condition) => (
            <button
              key={condition.id}
              onClick={() => {
                setActiveCategory?.('all')
                onSelectFilter?.({ type: 'condition', value: condition.id })
              }}
              className="whitespace-nowrap px-6 py-3 rounded-full border-2 font-medium transition-all border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
            >
              {condition.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Categories
