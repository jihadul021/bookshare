import { useState } from 'react'
import api from './api'
import Navbar from './components/Navbar'; 
import Banner from './components/Banner';
import Categories from './components/Categories'
import BookGrid from './components/BookGrid';
import ProductDetails from './components/ProductDetails';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';

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
    const [currentView, setCurrentView] = useState('home') // 'home' | 'detail'
    
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


  return (
    
    // <div>
    //     <button onClick={checkHealth}>Check Health</button>
    //     {health && <p>{health}</p>}
    // </div>
        <div className="min-h-screen bg-gray-50">
          <Navbar onLogoClick={handleBack}/>
          {currentView === 'home' ? (
        <>
          <Banner />
          <Categories activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
          <BookGrid activeCategory={activeCategory} onItemClick={handleItemClick} />      
          <HowItWorks/>  
        </>
            ):(
                <ProductDetails item={selectedItem} onBack={handleBack} />
            )}
          <Footer />


        </div>
  )
}

export default App
