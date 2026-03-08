const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'fiction', label: 'Fiction' },
  { id: 'nonFiction', label: 'Non-Fiction' },
  { id: 'science', label: 'Science' },
  { id: 'history', label: 'History' },
  { id: 'biography', label: 'Biography' },
  { id: 'selfHelp', label: 'Self-Help' },
  { id: 'mystery', label: 'Mystery' },
  { id: 'academic', label: 'Academic' },
  { id: 'technology', label: 'Technology' },
  { id: 'children', label: 'Children' },
  { id: 'horror', label: 'Horror' },
  { id: 'romance', label: 'Romance' },
  { id: 'other', label: 'Other' },

]

function Categories({ activeCategory, setActiveCategory }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex overflow-x-auto gap-4 pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
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
    </section>
  )
}

export default Categories