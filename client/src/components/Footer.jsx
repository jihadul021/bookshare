function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="col-span-1 text-center md:text-left">
            <span className="text-xl font-bold">
              Book<span className="text-orange-500">Share</span>
            </span>
            <p className="text-gray-400 text-sm leading-relaxed mt-4 max-w-xs mx-auto md:mx-0">
              The community platform for exchanging, buying, and sharing books. Connect with readers, discover new stories, and build your collection.
            </p>
          </div>

          {/* Explore */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold mb-4 text-gray-100">Explore</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Browse Books</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">How to Exchange</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Buyer Protection</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Trust & Safety</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold mb-4 text-gray-100">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold mb-4 text-gray-100">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Support</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2026 BookShare Inc. All rights reserved.
          </p>
          <div className="flex space-x-6 text-gray-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer