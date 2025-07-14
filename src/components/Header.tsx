import React, { useEffect, useState } from 'react';
import { MenuIcon, X, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900/80 backdrop-blur-md shadow-lg shadow-violet-500/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <BrainCircuit className="h-8 w-8 text-violet-500 animate-pulse-glow" />
              <span className="ml-2 text-2xl font-bold">
                <span className="text-white">self</span>
                <span className="gradient-text">interview</span>
                <span className="text-xs align-top ml-1 text-violet-500">
                  AI+
                </span>
              </span>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            {[{label: 'About', href: '#about'}, {label: 'Features', href: '#features'}, {label: 'How It Works', href: '#how-it-works'}, {label: 'Contact', href: '#contact'}].map((item, index) => (
              <a key={index} href={item.href} className="text-sm font-medium text-gray-300 hover:text-violet-400 transition-colors relative group">
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center">
            <a href="#login" className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 transition-colors" onClick={e => { e.preventDefault(); navigate('/login'); }}>
              Log In
            </a>
            <a href="#signup" className="ml-4 relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow-lg shadow-violet-500/20 transition-all duration-300 hover:shadow-violet-500/40" onClick={e => { e.preventDefault(); navigate('/signup'); }}>
              <span className="relative z-10">Sign Up</span>
            </a>
          </div>
          <div className="flex md:hidden">
            <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <X className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileMenuOpen && <div className="md:hidden glass-effect animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {[{label: 'About', href: '#about'}, {label: 'Features', href: '#features'}, {label: 'How It Works', href: '#how-it-works'}, {label: 'Contact', href: '#contact'}].map((item, index) => (
              <a key={index} href={item.href} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center justify-between px-3">
                <a href="#login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors" onClick={e => { e.preventDefault(); setMobileMenuOpen(false); navigate('/login'); }}>
                  Log In
                </a>
                <a href="#signup" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700" onClick={e => { e.preventDefault(); setMobileMenuOpen(false); navigate('/signup'); }}>
                  Sign Up
                </a>
              </div>
            </div>
          </div>
        </div>}
    </header>;
};