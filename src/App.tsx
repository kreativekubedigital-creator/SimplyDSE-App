import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DesignSystem from './components/DesignSystem';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Login from './pages/Login';
import BlogPost from './pages/BlogPost';
import LoginModal from './components/LoginModal';

const AppContent = () => {
  const [showDesignSystem, setShowDesignSystem] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleToggle = () => setShowDesignSystem(prev => !prev);
    window.addEventListener('toggle-design-system', handleToggle);
    return () => window.removeEventListener('toggle-design-system', handleToggle);
  }, []);

  const isAuthPage = location.pathname === '/login';

  return (
    <div className="simplydse-root min-h-screen bg-white text-text-primary selection:bg-brand-primary/10 selection:text-brand-primary overflow-x-hidden">
      {!isAuthPage && <Navbar onLoginClick={() => setIsLoginOpen(true)} />}
      
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      {showDesignSystem ? (
        <DesignSystem />
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      )}
      
      {!isAuthPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
