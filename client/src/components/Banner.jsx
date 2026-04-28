function Banner() {
  return (
       <section className="relative bg-gray-900 text-white">
        
        {/* Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-150784272343-583f20270319?auto=format&fit=crop&w=2000&q=80"
            alt="books background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
        </div>

        {/* Banner Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-2xl leading-tight mb-6">
            Exchange, rent, or buy books <br/>
            <span className="text-orange-500">Share stories with your community.</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-gray-300 max-w-xl mb-10 leading-relaxed">
            Join book lovers exchanging stories. Find your next great read, discover hidden gems, and connect with readers in your community.
          </p>

          {/* Search Bar
          <div className="w-full max-w-3xl bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center bg-gray-100 rounded-xl px-4 py-3">
              <input
                type="text"
                placeholder="Search books (e.g. The Great Gatsby)"
                className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-500"
              />
            </div>
            <div className="flex-1 flex items-center bg-gray-100 rounded-xl px-4 py-3">
              <input
                type="text"
                placeholder="Where? (e.g. Dhaka, Bangladesh)"
                className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-500"
              />
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors">
              Search
            </button>
          </div> */}

        </div>
      </section>
  )
}

export default Banner