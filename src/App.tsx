import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { useAuth } from './hooks/useAuth';

// Lazy load auth pages
const Login = React.lazy(() => import('./components/Login'));
const Signup = React.lazy(() => import('./components/Signup'));
const Home = React.lazy(() => import('./components/Home'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Interview = React.lazy(() => import('./components/Interview'));
const InterviewSystemCheck = React.lazy(() => import('./components/InterviewSystemCheck'));
const Livesession = React.lazy(() => import('./components/Livesession'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white">Loading...</div>
    </div>;
  }
  
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white">Loading...</div>
    </div>;
  }
  
  if (user) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function LandingPage() {
  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = (e.target as HTMLAnchorElement).getAttribute('href');
        if (targetId && targetId !== '#') {
          document.querySelector(targetId)?.scrollIntoView({
            behavior: 'smooth'
          });
        }
      });
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in-section').forEach(section => {
      observer.observe(section);
    });
    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', function () {});
      });
    };
  }, []);
  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-900 text-white overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-gray-900 to-gray-900 -z-10"></div>
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <Router>
      {/* Mobile Blocker Overlay */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900 text-white text-center px-6 md:hidden">
        <div className="max-w-sm mx-auto">
          <h2 className="text-2xl font-bold mb-4">Laptop/Desktop Required</h2>
          <p className="text-lg mb-2">This interview platform is designed for use on a laptop or desktop computer.</p>
          <p className="text-gray-400">Please access this site from a larger screen for the best experience.</p>
        </div>
      </div>
      <React.Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
        <Routes>
          <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
          <Route path="/system-check" element={<ProtectedRoute><InterviewSystemCheck /></ProtectedRoute>} />
          <Route path="/livesession" element={<ProtectedRoute><Livesession /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
}