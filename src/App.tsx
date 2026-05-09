import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Trust from './components/Trust';
import Features from './components/Features';
import Solutions from './components/Solutions';
import Workflow from './components/Workflow';
import DashboardPreview from './components/DashboardPreview';
import Challenges from './components/Challenges';
import Security from './components/Security';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import DesignSystem from './components/DesignSystem';

function App() {
  const [showDesignSystem, setShowDesignSystem] = useState(false);

  useEffect(() => {
    const handleToggle = () => setShowDesignSystem(prev => !prev);
    window.addEventListener('toggle-design-system', handleToggle);
    return () => window.removeEventListener('toggle-design-system', handleToggle);
  }, []);

  return (
    <div className="simplydse-root min-h-screen bg-white text-text-primary selection:bg-brand-primary selection:text-white overflow-x-hidden">
      <Navbar />
      
      {showDesignSystem ? (
        <DesignSystem />
      ) : (
        <main>
          {/* Section 1: Hero */}
          <div>
            <Hero />
          </div>
          
          {/* Section 2: Trust (White) */}
          <Trust />

          {/* Section 3: Features (Light Gray) */}
          <div className="bg-bg-light border-y border-border-subtle">
            <Features />
          </div>

          <Solutions />

          {/* Section 4: Workflow (White) */}
          <Workflow />

          {/* Section 5: Dashboard Preview (Soft Gray/Blue Accent) */}
          <div className="bg-slate-50 border-y border-border-subtle">
            <DashboardPreview />
          </div>

          {/* Section 6: Challenges (White) */}
          <Challenges />

          {/* Section 7: Security (Light Gray) */}
          <div className="bg-bg-light border-y border-border-subtle">
            <Security />
          </div>

          {/* Section 8: Testimonials (White) */}
          <Testimonials />

          {/* Section 9: FAQ (Light Gray) */}
          <div className="bg-bg-light border-t border-border-subtle">
            <FAQ />
          </div>
        </main>
      )}
      
      <Footer />
    </div>
  );
}

export default App;
