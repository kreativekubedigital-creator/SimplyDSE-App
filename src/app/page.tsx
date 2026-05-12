'use client';

import { useState } from 'react';
import Hero from '../components/Hero';
import Trust from '../components/Trust';
import FeaturesGrid from '../components/FeaturesGrid';
import Solutions from '../components/Solutions';
import Workflow from '../components/Workflow';
import DashboardPreview from '../components/DashboardPreview';
import Challenges from '../components/Challenges';
import Security from '../components/Security';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import HumanImpact from '../components/HumanImpact';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';

export default function HomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="simplydse-root min-h-screen bg-white text-text-primary selection:bg-brand-primary/10 selection:text-brand-primary overflow-x-hidden">
      <Navbar onLoginClick={() => setIsLoginOpen(true)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      <main>
        <Hero />
        <Trust />
        <FeaturesGrid />
        <Workflow />
        <Challenges />
        <Solutions />
        <HumanImpact />
        <div className="bg-slate-50 border-y border-border-subtle">
          <DashboardPreview />
        </div>
        <div className="bg-bg-light border-y border-border-subtle">
          <Security />
        </div>
        <Testimonials />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
