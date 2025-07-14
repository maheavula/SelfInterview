import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  
  const conversation = [
    {
      speaker: 'ai',
      message: "Hello! I'm your AI interviewer. Let's start with a behavioral question. Can you tell me about a time when you had to solve a complex problem at work?",
      delay: 1000
    },
    {
      speaker: 'user',
      message: "Sure! In my previous role as a software engineer, I was tasked with optimizing our database queries that were causing significant performance issues...",
      delay: 2000
    },
    {
      speaker: 'ai',
      message: "That's a great example! I notice you're using specific metrics. Can you elaborate on how you measured the success of your solution?",
      delay: 1500
    },
    {
      speaker: 'user',
      message: "Absolutely! We measured success through query response time reduction from 15 seconds to under 2 seconds, and a 40% improvement in overall system performance...",
      delay: 1800
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => {
        setCurrentMessage((prev) => (prev + 1) % conversation.length);
        setIsTyping(false);
      }, 1000);
    }, 4000);

    return () => clearInterval(interval);
  }, [conversation.length]);

  return (
    <section className="relative py-20 md:py-28 lg:py-32 overflow-hidden">
      <div className="mesh-grid absolute inset-0 opacity-20"></div>
      {/* Animated background elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-float-slow"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 bg-gray-800 rounded-full mb-6 border border-violet-500/20">
            <Sparkles className="h-4 w-4 text-violet-400 mr-2" />
            <span className="text-sm font-medium text-gray-300">
              Introducing NextGen AI Interview Technology
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Master Your Interviews with <br />
            <span className="gradient-text">Advanced AI Training</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
            selfinterview AI+ uses cutting-edge artificial intelligence to create
            hyper-realistic interview simulations with real-time feedback and
            personalized coaching.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <a
              href="#signup"
              className="px-8 py-3 text-base font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-violet-500/40 shadow-violet-500/20"
              onClick={e => { e.preventDefault(); navigate('/signup'); }}
            >
              Start Practice
            </a>
          </div>
        </div>

        {/* Interactive AI interview simulator preview */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700 glass-effect">
            {/* Chat Header */}
            <div className="p-4 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="ml-4 text-sm font-medium text-gray-400">
                  selfinterview AI+ Interview Simulator
                </span>
              </div>
              <div className="text-sm text-gray-400">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-violet-900/30 text-violet-300">
                  <span className="h-2 w-2 bg-violet-400 rounded-full mr-1.5 animate-pulse"></span>
                  Live Session
                </span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="p-6 space-y-6">
              {conversation.slice(0, currentMessage + 1).map((msg, index) => (
                <div key={index} className={`flex items-start ${msg.speaker === 'ai' ? '' : 'flex-row-reverse'}`}>
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${msg.speaker === 'ai' ? 'bg-violet-600' : 'bg-gray-600'}`}>
                    {msg.speaker === 'ai' ? (
                      <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                        <path d="M12 6v6l4 2"/>
                        <path d="M12 18h.01"/>
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                      </svg>
                    )}
                  </div>
                  
                  {/* Message */}
                  <div className={`${msg.speaker === 'ai' ? 'ml-4 bg-gray-700 rounded-lg p-4 rounded-tl-none' : 'mr-4 bg-gray-700/50 rounded-lg p-4 rounded-tr-none border border-gray-600'}`}>
                    <p className={`font-medium ${msg.speaker === 'ai' ? 'text-violet-300' : 'text-gray-200'}`}>
                      {msg.speaker === 'ai' ? 'AI Interviewer' : 'You'}
                    </p>
                    <p className="text-gray-300 mt-1">
                      {msg.message}
                      {index === currentMessage && isTyping && (
                        <span className="animate-pulse">|</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                      <path d="M12 6v6l4 2"/>
                      <path d="M12 18h.01"/>
                    </svg>
                  </div>
                  <div className="ml-4 bg-gray-700 rounded-lg p-4 rounded-tl-none">
                    <p className="text-violet-300 font-medium">AI Interviewer</p>
                    <div className="flex items-center h-6 mt-1">
                      <div className="h-3 w-3 bg-violet-500 rounded-full animate-pulse mr-1"></div>
                      <div className="h-3 w-3 bg-violet-500 rounded-full animate-pulse mr-1" style={{animationDelay: '0.2s'}}></div>
                      <div className="h-3 w-3 bg-violet-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Input Area */}
            <div className="p-4 bg-gray-900 border-t border-gray-700 flex items-center">
              <input 
                type="text" 
                placeholder="Type your answer or click to speak..." 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" 
              />
              <button className="ml-2 p-2 rounded-full bg-violet-600 hover:bg-violet-700 transition-colors">
                <Sparkles className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
          {/* Stats overlay */}
          <div className="absolute -right-4 top-1/4 transform translate-x-1/2 animate-float">
            <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-violet-500/20 glass-effect">
              <div className="text-sm text-gray-300">Confidence Score</div>
              <div className="text-2xl font-bold text-violet-400">87%</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div className="bg-violet-500 h-2 rounded-full" style={{width: '87%'}}></div>
              </div>
            </div>
          </div>
          <div className="absolute -left-4 bottom-1/4 transform -translate-x-1/2 animate-float-slow" style={{animationDelay: '1s'}}>
            <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-indigo-500/20 glass-effect">
              <div className="text-sm text-gray-300">Response Quality</div>
              <div className="text-2xl font-bold text-indigo-400">92%</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{width: '92%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};