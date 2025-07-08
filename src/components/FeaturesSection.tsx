import React from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FeaturesSection = () => {
  const features = [
    {
      name: 'Resume Based Interviews',
      description: 'Upload your resume and get personalized interview questions based on your experience, skills, and career background.',
      icon: (
        <svg className="h-6 w-6 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
          <path d="M14 2v6h6"/>
          <path d="M16 13H8"/>
          <path d="M16 17H8"/>
          <path d="M10 9H8"/>
        </svg>
      ),
      gradient: 'from-violet-500 to-indigo-500'
    },
    {
      name: 'Job Description Matching',
      description: 'Match your skills with specific job descriptions and practice interviews tailored to your target role and company.',
      icon: (
        <svg className="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4"/>
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
          <path d="M15 8l-3 3-3-3"/>
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Any Role Based Practice',
      description: 'Practice interviews for any role across all industries - from entry-level to executive positions.',
      icon: (
        <svg className="h-6 w-6 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      gradient: 'from-emerald-500 to-green-500'
    },
    {
      name: 'Analytics & Performance Reports',
      description: 'Get detailed analytics on your interview performance with actionable insights and improvement recommendations.',
      icon: (
        <svg className="h-6 w-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 20V10"/>
          <path d="M12 20V4"/>
          <path d="M6 20v-6"/>
          <path d="M3 20h18"/>
        </svg>
      ),
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      name: 'Choose Interview Type',
      description: 'Select from various interview formats: behavioral, technical, case study, situational, or mixed format interviews.',
      icon: (
        <svg className="h-6 w-6 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      gradient: 'from-rose-500 to-pink-500'
    },
    {
      name: 'AI-Driven Real-time Feedback',
      description: 'Receive instant feedback on your responses, body language, tone, and communication style during interviews.',
      icon: (
        <svg className="h-6 w-6 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
          <path d="M12 6v6l4 2"/>
          <path d="M12 18h.01"/>
        </svg>
      ),
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      name: 'Neural AI Interviews',
      description: 'Experience hyper-realistic AI interviews that adapt to your responses and provide dynamic conversation flow.',
      icon: (
        <svg className="h-6 w-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
      ),
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      name: 'Industry-Specific Training',
      description: 'Access specialized interview questions and scenarios tailored to your specific industry and role requirements.',
      icon: (
        <svg className="h-6 w-6 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
      ),
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      name: 'Personalized Growth Path',
      description: 'Get a customized learning path with targeted exercises and practice sessions based on your performance data.',
      icon: (
        <svg className="h-6 w-6 text-lime-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      ),
      gradient: 'from-lime-500 to-green-500'
    }
  ];

  const navigate = useNavigate();

  return (
    <section id="features" className="py-24 relative overflow-hidden fade-in-section">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full mesh-grid opacity-10"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-900/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-1.5 bg-gray-800 rounded-full mb-6 border border-violet-500/20">
            <Sparkles className="h-4 w-4 text-violet-400 mr-2" />
            <span className="text-sm font-medium text-gray-300">
              Advanced Features
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            Powered by{' '}
            <span className="gradient-text">Advanced AI Technology</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
            selfinterview AI+ combines multiple artificial intelligence systems to
            deliver the most comprehensive interview preparation experience
            available today.
          </p>
        </div>
        
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="relative group">
                <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-violet-500/50 transition-all duration-300 h-full flex flex-col glass-effect group-hover:shadow-lg group-hover:shadow-violet-500/10">
                  <div className={`bg-gradient-to-r ${feature.gradient} rounded-lg w-12 h-12 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.name}
                  </h3>
                  <p className="text-gray-300 flex-grow">
                    {feature.description}
                  </p>
                  <div className="h-1 w-0 bg-gradient-to-r from-violet-500 to-indigo-500 mt-6 group-hover:w-full transition-all duration-300"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-20 text-center">
          <a href="#signup" className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-300" onClick={e => { e.preventDefault(); navigate('/signup'); }}>
            Start Free Trial
          </a>
        </div>
      </div>
    </section>
  );
};