import { useState } from 'react'
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
    const [currentView, setCurrentView] = useState('home') // 'home' | 'detail' | 'login' | 'register' | 'profile' | 'addbook'
    const [currentUser, setCurrentUser] = useState(getStoredUser)
    
    const handleItemClick = (item) => {
      setSelectedItem(item)
      setCurrentView('detail')
      window.scrollTo(0, 0)
    }

    const handleBack = () => {
      setSelectedItem(null)
      setCurrentView('home')
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

    const handleBookAdded = (book) => {
      setCurrentView('profile')
      window.scrollTo(0, 0)
    }


  return (
        <div className="min-h-screen bg-gray-50">
          <Navbar
            onLogoClick={handleBack}
            onBrowseClick={handleBack}
            onLoginClick={handleShowLogin}
            onRegisterClick={handleShowRegister}
            onLogoutClick={handleLogout}
            onMyProfileClick={handleMyProfile}
            isLoggedIn={Boolean(currentUser?.token)}
            userName={currentUser?.name}
            profilePicture={currentUser?.profilePicture}
          />
          {currentView === 'home' ? (
        <>
          <Banner />
          <Categories activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
          <BookGrid activeCategory={activeCategory} onItemClick={handleItemClick} />      
          <HowItWorks/>  
        </>
            ) : currentView === 'detail' ? (
                <ProductDetails item={selectedItem} onBack={handleBack} />
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
            ) : currentView === 'profile' ? (
                <ProfilePage
                  token={currentUser?.token}
                  initialUser={currentUser}
                  onBackHome={handleBack}
                  onRequireLogin={handleShowLogin}
                  onProfileUpdated={handleAuthSuccess}
                  onAddBook={handleAddBook}
                />
            ) : (
                <RegisterPage
                  onSwitchToLogin={handleShowLogin}
                  onBackHome={handleBack}
                  onAuthSuccess={handleAuthSuccess}
                />
            )}
          <Footer />


        </div>
  )
}

export default App
