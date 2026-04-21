import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'; 
import Banner from './components/Banner';
import Categories from './components/Categories'
import BookGrid from './components/BookGrid';
import ProductDetails from './components/ProductDetails';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
import AddBookPage from './components/AddBookPage';
import MyBooksPage from './components/MyBooksPage';
import CartPage from './components/CartPage';
import WishlistPage from './components/WishlistPage';
import SearchResults from './components/SearchResults';
import SellerProfile from './components/SellerProfile';
import Checkout from './components/Checkout';
import Congratulations from './components/Congratulations';
import OrderDetails from './components/OrderDetails';
import SellerOrderManagement from './components/SellerOrderManagement';
import Inbox from './components/Inbox';
import ChatWindow from './components/ChatWindow';
import AdminDashboard from './components/AdminDashboard';
import api from './api';
import { connectSocket, disconnectSocket } from './socket';

const DEFAULT_SEARCH_FILTERS = {
  category: [],
  condition: [],
  minPrice: null,
  maxPrice: null,
  location: '',
  minRating: null,
  sortBy: 'newest'
}

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem('bookshareUser')
    return rawUser ? JSON.parse(rawUser) : null
  } catch (error) {
    console.error('Failed to parse stored user:', error)
    return null
  }
}

function App() {
  // Health check
  // const [health, setHealth] = useState(null);

  // const checkHealth = ()=>{
  //   api.get('/api/health')
  //   .then(res => setHealth(res.data.status === 'ok' ? 'OK' : 'NOT OK'))
  //   .catch(() => setHealth("NOT OK"));
  // }
    const [activeCategory, setActiveCategory] = useState('all')
    const [selectedItem, setSelectedItem] = useState(null)
    const [currentView, setCurrentView] = useState('home') // 'home' | 'detail' | 'login' | 'register' | 'profile' | 'addbook' | 'mybooks' | 'cart' | 'wishlist' | 'search' | 'seller' | 'checkout' | 'congratulations' | 'orders' | 'seller-orders' | 'inbox' | 'chat' | 'admin'
    const [currentUser, setCurrentUser] = useState(getStoredUser)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSellerId, setSelectedSellerId] = useState(null)
    const [cartForCheckout, setCartForCheckout] = useState(null)
    const [completedOrder, setCompletedOrder] = useState(null)
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [adminInitialTab, setAdminInitialTab] = useState('dashboard')
    const [detailReturnView, setDetailReturnView] = useState('home')
    const [checkoutReturnView, setCheckoutReturnView] = useState('cart')
    const [searchFilters, setSearchFilters] = useState(DEFAULT_SEARCH_FILTERS)
    
    useEffect(() => {
      if (currentUser?._id) {
        connectSocket(currentUser._id);
      }

      return () => {
        if (!currentUser?.token) {
          disconnectSocket();
        }
      }
    }, [currentUser?._id, currentUser?.token])
    
    const handleItemClick = (item) => {
      setSelectedItem(item)
      setDetailReturnView('home')
      setCurrentView('detail')
      window.scrollTo(0, 0)
    }

    const handleBack = () => {
      setSelectedItem(null)
      setCurrentView('home')
      window.scrollTo(0, 0)
    }

    const handleBackFromDetail = () => {
      setSelectedItem(null)
      setCurrentView(detailReturnView)
      window.scrollTo(0, 0)
    }

    const handleShowLogin = () => {
      setCurrentView('login')
      window.scrollTo(0, 0)
    }

    const handleShowRegister = () => {
      setCurrentView('register')
      window.scrollTo(0, 0)
    }

    const handleAuthSuccess = (userData) => {
      localStorage.setItem('bookshareUser', JSON.stringify(userData))
      setCurrentUser(userData)
    }

    const handleLogout = () => {
      disconnectSocket()
      localStorage.removeItem('bookshareUser')
      setCurrentUser(null)
      handleBack()
    }

    const handleMyProfile = () => {
      if (!currentUser?.token) {
        handleShowLogin()
        return
      }

      setSelectedItem(null)
      setCurrentView('profile')
      window.scrollTo(0, 0)
    }

    const handleAddBook = () => {
      if (!currentUser?.token) {
        handleShowLogin()
        return
      }
      setCurrentView('addbook')
      window.scrollTo(0, 0)
    }

    const handleBackFromAddBook = () => {
      setCurrentView('profile')
      window.scrollTo(0, 0)
    }

    const handleBookAdded = () => {
      setCurrentView('profile')
      window.scrollTo(0, 0)
    }

    const handleViewCart = () => {
      if (!currentUser?.token) {
        handleShowLogin()
        return
      }
      setCurrentView('cart')
      window.scrollTo(0, 0)
    }

    const handleBackFromCart = () => {
      setCurrentView('home')
      window.scrollTo(0, 0)
    }

    const handleViewWishlist = () => {
      if (!currentUser?.token) {
        handleShowLogin()
        return
      }
      setCurrentView('wishlist')
      window.scrollTo(0, 0)
    }

    const handleBackFromWishlist = () => {
      setCurrentView('home')
      window.scrollTo(0, 0)
    }

    const handleViewMyBooks = () => {
      if (!currentUser?.token) {
        handleShowLogin()
        return
      }
      setCurrentView('mybooks')
      window.scrollTo(0, 0)
    }

    const handleBackFromMyBooks = () => {
      setCurrentView('profile')
      window.scrollTo(0, 0)
    }

    const handleSearch = (query = '', nextFilters = DEFAULT_SEARCH_FILTERS) => {
      setSearchQuery(query)
      setSearchFilters({ ...DEFAULT_SEARCH_FILTERS, ...nextFilters })
      setCurrentView('search')
      window.scrollTo(0, 0)
    }

    const handleBackFromSearch = () => {
      setSearchQuery('')
      setCurrentView('home')
      window.scrollTo(0, 0)
    }

    const handleViewSeller = (sellerId) => {
      setSelectedSellerId(sellerId)
      setCurrentView('seller')
      window.scrollTo(0, 0)
    }

    const handleBackFromSeller = () => {
      setSelectedSellerId(null)
      setCurrentView('home')
      window.scrollTo(0, 0)
    }

    const handleProceedToCheckout = (cart) => {
      if (!currentUser?.token) {
        handleShowLogin()
        return
      }
      setCheckoutReturnView('cart')
      setCartForCheckout(cart)
      setCurrentView('checkout')
      window.scrollTo(0, 0)
    }

    const handleOrderSuccess = (order) => {
      setCompletedOrder(order)
      setCurrentView('congratulations')
      window.scrollTo(0, 0)
    }

    const handleBackFromCheckout = () => {
      setCurrentView(checkoutReturnView)
      window.scrollTo(0, 0)
    }

    const handleBackFromCongratulations = () => {
      setCompletedOrder(null)
      setCartForCheckout(null)
      setCurrentView('home')
      window.scrollTo(0, 0)
    }

    const handleViewOrders = () => {
      if (!currentUser?.token) {
        handleShowLogin()
        return
      }
      setCurrentView('orders')
      window.scrollTo(0, 0)
    }

    const handleBackFromOrders = () => {
      setCurrentView('profile')
      window.scrollTo(0, 0)
    }

    const handleViewSellerOrders = () => {
      if (!currentUser?.token) {
        handleShowLogin()
        return
      }
      setCurrentView('seller-orders')
      window.scrollTo(0, 0)
    }

    const handleBackFromSellerOrders = () => {
      setCurrentView('profile')
      window.scrollTo(0, 0)
    }

    const handleShowInbox = () => {
      if (!currentUser?.token) {
        handleShowLogin()
        return
      }
      setCurrentView('inbox')
      window.scrollTo(0, 0)
    }

    const handleBackFromInbox = () => {
      setSelectedConversation(null)
      setCurrentView('home')
      window.scrollTo(0, 0)
    }

    const handleSelectConversation = (conversation) => {
      setSelectedConversation(conversation)
      setCurrentView('chat')
      window.scrollTo(0, 0)
    }

    const handleBackFromChat = () => {
      setSelectedConversation(null)
      setCurrentView('inbox')
      window.scrollTo(0, 0)
    }

    const handleViewAdminDashboard = (profileUser) => {
      const effectiveUser = profileUser || currentUser

      if (!currentUser?.token || effectiveUser?.role !== 'admin') {
        handleBack()
        return
      }

      if (profileUser) {
        handleAuthSuccess({ ...currentUser, ...profileUser, token: currentUser.token })
      }

      setAdminInitialTab('dashboard')
      setCurrentView('admin')
      window.scrollTo(0, 0)
    }

    const handleBackFromAdmin = () => {
      setAdminInitialTab('dashboard')
      setCurrentView('profile')
      window.scrollTo(0, 0)
    }

    const handleAdminViewBook = async (bookId) => {
      try {
        const response = await api.get(`/api/books/${bookId}`)
        setSelectedItem(response.data)
        setAdminInitialTab('books')
        setDetailReturnView('admin')
        setCurrentView('detail')
        window.scrollTo(0, 0)
      } catch (error) {
        console.error('Failed to load book details from admin dashboard:', error)
      }
    }

    const handleBrowseAll = () => {
      handleSearch('', DEFAULT_SEARCH_FILTERS)
    }

    const handleHomepageFilter = ({ type, value }) => {
      const nextFilters = { ...DEFAULT_SEARCH_FILTERS }
      if (type === 'category') {
        nextFilters.category = [value]
      }
      if (type === 'condition') {
        nextFilters.condition = [value]
      }
      handleSearch('', nextFilters)
    }

    const handleBuyNow = (book, quantity = 1) => {
      if (!currentUser?.token) {
        handleShowLogin()
        return
      }

      setCheckoutReturnView('detail')
      setCartForCheckout({
        items: [
          {
            book,
            quantity
          }
        ],
        totalPrice: book.price * quantity,
        totalItems: 1
      })
      setCurrentView('checkout')
      window.scrollTo(0, 0)
    }

    const handleExchangeCheckout = (book) => {
      if (!currentUser?.token) {
        handleShowLogin()
        return
      }

      setCheckoutReturnView('detail')
      setCartForCheckout({
        exchangeMode: true,
        requestedBook: book,
        items: [
          {
            book,
            quantity: 1
          }
        ],
        totalPrice: 0,
        totalItems: 1
      })
      setCurrentView('checkout')
      window.scrollTo(0, 0)
    }

  return (
        <div className="min-h-screen bg-gray-50">
          <Navbar
            onLogoClick={handleBack}
            onBrowseClick={handleBrowseAll}
            onLoginClick={handleShowLogin}
            onRegisterClick={handleShowRegister}
            onLogoutClick={handleLogout}
            onMyProfileClick={handleMyProfile}
            onCartClick={handleViewCart}
            onWishlistClick={handleViewWishlist}
            onChatClick={handleShowInbox}
            onSearch={handleSearch}
            isLoggedIn={Boolean(currentUser?.token)}
            userName={currentUser?.name}
            profilePicture={currentUser?.profilePicture}
            token={currentUser?.token}
          />
          {currentView === 'home' ? (
        <>
          <Banner />
          <Categories activeCategory={activeCategory} setActiveCategory={setActiveCategory} onSelectFilter={handleHomepageFilter} />
          <BookGrid activeCategory={activeCategory} onItemClick={handleItemClick} token={currentUser?.token} onShowCart={handleViewCart} onShowWishlist={handleViewWishlist} onSeeAll={handleBrowseAll} />      
          <HowItWorks/>  
        </>
            ) : currentView === 'detail' ? (
                <ProductDetails
                  item={selectedItem}
                  onBack={handleBackFromDetail}
                  token={currentUser?.token}
                  onViewSeller={handleViewSeller}
                  onSelectBook={handleItemClick}
                  onBuyNow={handleBuyNow}
                  onRequestExchange={handleExchangeCheckout}
                />
            ) : currentView === 'login' ? (
                <LoginPage
                  onSwitchToRegister={handleShowRegister}
                  onBackHome={handleBack}
                  onAuthSuccess={handleAuthSuccess}
                />
            ) : currentView === 'addbook' ? (
                <AddBookPage
                  token={currentUser?.token}
                  onBackHome={handleBackFromAddBook}
                  onBookAdded={handleBookAdded}
                  onRequireLogin={handleShowLogin}
                />
            ) : currentView === 'mybooks' ? (
                <MyBooksPage
                  token={currentUser?.token}
                  onBackHome={handleBackFromMyBooks}
                  onRequireLogin={handleShowLogin}
                />
            ) : currentView === 'profile' ? (
                <ProfilePage
                  token={currentUser?.token}
                  initialUser={currentUser}
                  onBackHome={handleBack}
                  onRequireLogin={handleShowLogin}
                  onProfileUpdated={handleAuthSuccess}
                  onAddBook={handleAddBook}
                  onViewMyBooks={handleViewMyBooks}
                  onViewOrders={handleViewOrders}
                  onViewSellerOrders={handleViewSellerOrders}
                  onViewAdminDashboard={handleViewAdminDashboard}
                />
            ) : currentView === 'admin' ? (
                <div style={{ marginLeft: 0, paddingTop: '20px' }}>
                  <AdminDashboard
                    onBack={handleBackFromAdmin}
                    initialTab={adminInitialTab}
                    onViewBook={handleAdminViewBook}
                  />
                </div>
            ) : currentView === 'cart' ? (
                <CartPage
                  token={currentUser?.token}
                  onBack={handleBackFromCart}
                  onRequireLogin={handleShowLogin}
                  onProceedToCheckout={handleProceedToCheckout}
                />
            ) : currentView === 'wishlist' ? (
                <WishlistPage
                  token={currentUser?.token}
                  onBack={handleBackFromWishlist}
                  onRequireLogin={handleShowLogin}
                />
            ) : currentView === 'search' ? (
                <SearchResults
                  searchQuery={searchQuery}
                  initialFilters={searchFilters}
                  onBack={handleBackFromSearch}
                  token={currentUser?.token}
                  onItemClick={handleItemClick}
                  onShowCart={handleViewCart}
                  onShowWishlist={handleViewWishlist}
                />
            ) : currentView === 'seller' ? (
                <SellerProfile
                  sellerId={selectedSellerId}
                  onBack={handleBackFromSeller}
                  token={currentUser?.token}
                  onItemClick={handleItemClick}
                  onShowCart={handleViewCart}
                  onShowWishlist={handleViewWishlist}
                />
            ) : currentView === 'checkout' ? (
                <Checkout
                  cart={cartForCheckout}
                  onOrderSuccess={handleOrderSuccess}
                  onBack={handleBackFromCheckout}
                />
            ) : currentView === 'congratulations' ? (
                <Congratulations
                  order={completedOrder}
                  onBackHome={handleBackFromCongratulations}
                />
            ) : currentView === 'orders' ? (
                <OrderDetails
                  onBack={handleBackFromOrders}
                />
            ) : currentView === 'seller-orders' ? (
                <SellerOrderManagement
                  onBack={handleBackFromSellerOrders}
                />
            ) : currentView === 'inbox' ? (
                <Inbox
                  onSelectConversation={handleSelectConversation}
                  onBack={handleBackFromInbox}
                  token={currentUser?.token}
                />
            ) : currentView === 'chat' ? (
                <ChatWindow
                  conversation={selectedConversation}
                  onBack={handleBackFromChat}
                  token={currentUser?.token}
                />
            ) : (
                <RegisterPage
                  onSwitchToLogin={handleShowLogin}
                  onBackHome={handleBack}
                  onAuthSuccess={handleAuthSuccess}
                />
            )}
          {currentView !== 'admin' && <Footer />}


        </div>
  )
}

export default App
