import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DesignSystem from './components/DesignSystem';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Blog from './pages/Blog';
import Contact from './pages/Contact';

function App() {
  const [showDesignSystem, setShowDesignSystem] = useState(false);

  useEffect(() => {
    const handleToggle = () => setShowDesignSystem(prev => !prev);
    window.addEventListener('toggle-design-system', handleToggle);
    return () => window.removeEventListener('toggle-design-system', handleToggle);
  }, []);

  return (
    <Router>
      <div className="simplydse-root min-h-screen bg-white text-text-primary selection:bg-brand-primary/10 selection:text-brand-primary overflow-x-hidden">
        <Navbar />
        
        {showDesignSystem ? (
          <DesignSystem />
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        )}
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
