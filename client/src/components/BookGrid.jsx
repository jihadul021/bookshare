const ITEMS = [
  {
    id: 1,
    name: "The Great Gatsby",
    writer: "F. Scott Fitzgerald",
    category: "fiction",
    pricePerDay: 12,
    rating: 4.9,
    reviews: 2156,
    location: "Dhaka",
    owner: { name: "Sarah P.", joined: "2022", verified: true },
    image: "https://images.unsplash.com/photo-150784272343-583ccbbfb3f1?auto=format&fit=crop&w=800&q=80",
    description: "A classic American novel by F. Scott Fitzgerald about the Jazz Age and the pursuit of the American Dream. Beautifully written with complex characters and a compelling story.",
    features: ["Hardcover", "Complete", "Like New Condition", "By F. Scott Fitzgerald"]
  },
  {
    id: 2,
    name: "To Kill a Mockingbird",
    writer: "Harper Lee",
    category: "fiction",
    pricePerDay: 10,
    rating: 4.8,
    reviews: 1856,
    location: "Dhaka",
    owner: { name: "James M.", joined: "2023", verified: true },
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=80",
    description: "Harper Lee's masterpiece about racial injustice in the American South. A powerful and moving story that has captivated readers for generations.",
    features: ["Paperback", "Complete", "Good Condition", "By Harper Lee"]
  },
  {
    id: 3,
    name: "Sapiens: A Brief History of Humankind",
    writer: "Yuval Noah Harari",
    category: "nonFiction",
    pricePerDay: 15,
    rating: 4.7,
    reviews: 1267,
    location: "Dhaka",
    owner: { name: "Event Pro Rentals", joined: "2021", verified: true },
    image: "https://images.unsplash.com/photo-1507842754769-fc8483f337b4?auto=format&fit=crop&w=800&q=80",
    description: "Yuval Noah Harari explores the history of humanity from the Stone Age to modern times. A fascinating and thought-provoking examination of how humans came to dominate the world.",
    features: ["Hardcover", "Complete", "Like New", "By Yuval Noah Harari"]
  },
  {
    id: 4,
    name: "Cosmos: A Spacetime Odyssey",
    writer: "Carl Sagan",
    category: "science",
    pricePerDay: 14,
    rating: 4.9,
    reviews: 943,
    location: "Dhaka",
    owner: { name: "Alex R.", joined: "2023", verified: true },
    image: "https://images.unsplash.com/photo-1478239143407-778047f1cfc2?auto=format&fit=crop&w=800&q=80",
    description: "Carl Sagan's elegant exploration of the universe and our place in it. A journey through space and time that will expand your mind.",
    features: ["Hardcover", "Complete", "Like New Condition", "By Carl Sagan"]
  },
  {
    id: 5,
    name: "A Brief History of Time",
    writer: "Stephen Hawking",
    category: "science",
    pricePerDay: 12,
    rating: 4.8,
    reviews: 1156,
    location: "Rajshahi",
    owner: { name: "Pro Readers", joined: "2020", verified: true },
    image: "https://images.unsplash.com/photo-1507842739633-c7b4a4ad7d1a?auto=format&fit=crop&w=800&q=80",
    description: "Stephen Hawking explains complex physics concepts in an accessible way. From the Big Bang to Black Holes - a mind-bending journey through space and time.",
    features: ["Paperback", "Complete", "Good Condition", "By Stephen Hawking"]
  },
  {
    id: 6,
    name: "The Midnight Library",
    writer: "Matt Haig",
    category: "fantasy",
    pricePerDay: 11,
    rating: 4.9,
    reviews: 1045,
    location: "Tangail",
    owner: { name: "Maria C.", joined: "2022", verified: true },
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    description: "Matt Haig's enchanting novel about a woman who gets a chance to explore alternate versions of her life. Perfect for readers who love magical realism.",
    features: ["Hardcover", "Complete", "Like New", "By Matt Haig"]
  },
  {
    id: 7,
    name: "The Hobbit",
    writer: "J.R.R. Tolkien",
    category: "fantasy",
    pricePerDay: 13,
    rating: 4.7,
    reviews: 2102,
    location: "Dhaka",
    owner: { name: "Fantasy Lovers", joined: "2021", verified: true },
    image: "https://images.unsplash.com/photo-1507842499049-9f42e7b51ffe?auto=format&fit=crop&w=800&q=80",
    description: "Tolkien's classic fantasy adventure about Bilbo Baggins and his unexpected journey. A timeless tale of courage and discovery.",
    features: ["Hardcover", "Complete", "Excellent Condition", "By J.R.R. Tolkien"]
  },
  {
    id: 8,
    name: "Educated",
    writer: "Tara Westover",
    category: "biography",
    pricePerDay: 13,
    rating: 4.7,
    reviews: 987,
    location: "Sylhet",
    owner: { name: "Book Club Members", joined: "2023", verified: true },
    image: "https://images.unsplash.com/photo-1507842754769-fc8483f337b4?auto=format&fit=crop&w=800&q=80",
    description: "Tara Westover's powerful memoir about her unconventional upbringing and journey to education. A testament to the transformative power of learning.",
    features: ["Hardcover", "Complete", "Like New", "By Tara Westover"]
  },
  {
    id: 9,
    name: "Where the Crawdads Sing",
    writer: "Delia Owens",
    category: "mystery",
    pricePerDay: 12,
    rating: 4.8,
    reviews: 1589,
    location: "Chittagong",
    owner: { name: "Delia Owens Books", joined: "2022", verified: true },
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=80",
    description: "A mesmerizing mystery woven with exquisite nature writing. A story of isolation, love, and survival set in the marshlands.",
    features: ["Paperback", "Complete", "Good Condition", "By Delia Owens"]
  }
]

function ItemCard({ item, onItemClick }) {
  return (
    <div
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
      onClick={() => onItemClick(item)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 leading-tight mb-2 group-hover:text-orange-600 transition-colors">
          {item.name}
        </h3>
        <p className="text-gray-500 text-sm mb-3">by {item.writer}</p>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span className="text-amber-400 mr-1">★</span>
          <span className="font-medium text-gray-900">{item.rating}</span>
          <span className="ml-1">({item.reviews})</span>
          <span className="mx-2">•</span>
          <span>{item.location}</span>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
          <div>
            <span className="text-lg font-extrabold text-gray-900">${item.pricePerDay}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs border border-orange-200">
            {item.owner.name.charAt(0)}
          </div>
        </div>
      </div>
    </div>
  )
}

function BookGrid({ activeCategory, onItemClick }) {
  const filteredItems = activeCategory === 'all'
    ? ITEMS
    : ITEMS.filter(item => item.category === activeCategory)

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Books available near you</h2>
        <p className="text-gray-500 mt-1">Exchange, buy, or donate books in your community</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <ItemCard key={item.id} item={item} onItemClick={onItemClick} />
        ))}
      </div>
    </section>
  )
}

export default BookGrid