import React from 'react';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HowItWorksSection = () => {
  const steps = [{
    number: '01',
    title: 'Create Your Profile',
    description: 'Input your target industry, desired role, experience level, and interview goals for a personalized experience.',
    icon: '👤',
    color: 'from-violet-500 to-indigo-500'
  }, {
    number: '02',
    title: 'Select Interview Mode',
    description: 'Choose from behavioral, technical, case study, industry-specific, or custom interview formats.',
    icon: '🎯',
    color: 'from-blue-500 to-cyan-500'
  }, {
    number: '03',
    title: 'Train With AI',
    description: 'Engage in realistic interview simulations with our adaptive AI that responds naturally to your answers.',
    icon: '🤖',
    color: 'from-emerald-500 to-green-500'
  }, {
    number: '04',
    title: 'Receive Detailed Analytics',
    description: 'Get comprehensive feedback on your performance with specific improvement recommendations.',
    icon: '📊',
    color: 'from-amber-500 to-orange-500'
  }];
  const navigate = useNavigate();
  return <section id="how-it-works" className="py-24 relative overflow-hidden fade-in-section">
      <div className="mesh-grid absolute inset-0 opacity-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-1.5 bg-gray-800 rounded-full mb-6 border border-violet-500/20">
            <Sparkles className="h-4 w-4 text-violet-400 mr-2" />
            <span className="text-sm font-medium text-gray-300">
              Simple Process
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            How selfinterview <span className="gradient-text">AI+</span> Works
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
            Our streamlined process makes it easy to start practicing and
            improving your interview skills immediately.
          </p>
        </div>
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => <div key={index} className="relative group">
                <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-violet-500/50 transition-all duration-300 h-full glass-effect group-hover:shadow-lg group-hover:shadow-violet-500/10">
                  <div className="absolute -top-5 -left-5 w-14 h-14 rounded-full bg-gradient-to-r flex items-center justify-center text-xl font-bold text-white group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-violet-500/20" style={{
                backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                '--tw-gradient-from': step.color.split(' ')[0].split('-')[1] as string,
                '--tw-gradient-to': step.color.split(' ')[1].split('-')[1] as string
              } as React.CSSProperties}>
                    {step.number}
                  </div>
                  <div className="text-4xl mb-5 mt-2">{step.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-300">{step.description}</p>
                  {index < steps.length - 1 && <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-20">
                      <ArrowRight className="h-6 w-6 text-violet-500" />
                    </div>}
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </section>;
};