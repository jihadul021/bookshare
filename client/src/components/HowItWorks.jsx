function HowItWorks() {
  return (
    <section className="bg-white pt-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How BookShare Works</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Exchange, buy, or donate books in your community. Find your next favorite read and connect with book lovers nearby.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Find your book</h3>
            <p className="text-gray-500 leading-relaxed">
              Browse our collection and search for books by title, author, or genre. Filter by condition, price, and location.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 border border-orange-100">
              <span className="text-4xl">🤝</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Connect & Arrange</h3>
            <p className="text-gray-500 leading-relaxed">
              Message the seller securely. Arrange a time to exchange or buy the book at your convenience.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mb-6 border border-green-100">
              <span className="text-4xl">�</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Read & Share</h3>
            <p className="text-gray-500 leading-relaxed">
              Enjoy your new book! Return it when done for exchange, or keep it forever if you purchased it.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-orange-500 py-16 mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Have books you've finished?
          </h2>
          <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
            Share your favorite reads with your community. Exchange for new books, sell for extra cash, or donate to spread the love of reading.
          </p>
          <button className="bg-gray-900 text-white font-bold py-4 px-10 rounded-xl hover:bg-gray-800 transition-colors shadow-lg text-lg">
            List Your Books
          </button>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks