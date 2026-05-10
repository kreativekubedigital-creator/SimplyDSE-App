import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import getAssetPath from '../utils/wp-integration';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Solutions', href: '#solutions' },
    { name: 'Security', href: '#security' },
    { name: 'Resources', href: '#faq' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 ${
        isScrolled ? 'top-2' : 'top-0'
      }`}
    >
      <div 
        className={`max-w-7xl mx-auto transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-xl border border-border-strong/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-full py-3 px-8' 
            : 'bg-transparent py-4 px-4'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <img 
              src={getAssetPath('/simplydselogo.webp')} 
              alt="SimplyDSE Logo" 
              className="w-8 h-8 transition-opacity duration-500 group-hover:opacity-80"
            />
            <span className="text-xl font-bold text-text-primary tracking-tighter">SimplyDSE</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href}
                className="text-[13px] font-bold text-text-secondary hover:text-brand-primary transition-colors tracking-tight"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-8">
            <button className="text-[13px] font-bold text-text-secondary hover:text-text-primary transition-colors">
              Log in
            </button>
            <button className="btn-enterprise-primary !py-2.5 !px-6 !text-[13px] !rounded-xl">
              Get Started
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-6 right-6 bg-white border border-border-strong rounded-3xl p-8 shadow-2xl md:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  className="text-lg font-bold text-text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-border-subtle" />
              <button className="w-full btn-enterprise-primary py-4">
                Book Demo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
