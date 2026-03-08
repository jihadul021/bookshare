function ProductDetails({ item, onBack }) {
  if (!item) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        ← Back to books
      </button>

      <div className="flex flex-col lg:flex-row gap-10">

        {/* LEFT COLUMN */}
        <div className="w-full lg:w-2/3">

          {/* Image */}
          <div className="rounded-2xl overflow-hidden aspect-[16/9] mb-8">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Meta */}
          <div className="mb-8 border-b border-gray-200 pb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
              {item.name}
            </h1>
            <p className="text-gray-500 text-sm mb-3">by {item.writer}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center">
                <span className="text-amber-400 mr-1">★</span>
                <span className="font-bold text-gray-900">{item.rating}</span>
                <span className="text-gray-500 ml-1">({item.reviews} reviews)</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600">Location: {item.location}</span>
              <span className="text-gray-300">•</span>
              <span className="text-green-600 font-medium">✓ Verified seller</span>
            </div>
          </div>

          {/* Add to Cart & Wishlist */}
          <div className="flex gap-4 mb-8">
            <button className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8m10 0l2 8m-12 0h12" />
              </svg>
              Buy Now
            </button>
            <button className="flex items-center justify-center gap-2 border-2 border-black text-black hover:bg-gray-100 font-semibold py-3 px-6 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Wishlist
            </button>
          </div>

          {/* Owner */}
          <div className="flex items-center justify-between bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xl border border-orange-200 mr-4">
                {item.owner.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg"> {item.owner.name}</h3>
                <p className="text-gray-500 text-sm">
                  Joined {item.owner.joined} • {item.owner.verified ? 'Verified seller' : 'Unverified'}
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

          {/* Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Details</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {item.features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-gray-700 text-lg">
                  <span className="text-green-500 mr-3">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* RIGHT COLUMN — Purchase Card */}
        <div className="w-full lg:w-1/3">
          <div className="sticky top-24 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl">

            {/* Price */}
            <div className="flex items-end mb-6">
              <span className="text-3xl font-extrabold text-gray-900">$</span>
              <span className="text-2xl font-bold text-gray-900 ml-1">{item.pricePerDay}</span>
            </div>

            {/* Action Buttons */}
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-colors mb-3 text-lg">
              Buy Now
            </button>
            <button className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-bold py-4 px-6 rounded-xl transition-colors mb-3 text-lg">
              Request Exchange
            </button>

          </div>
        </div>

      </div>
    </div>
  )
}

export default ProductDetails