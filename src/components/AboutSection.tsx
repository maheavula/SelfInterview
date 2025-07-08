import React from 'react';
import { Sparkles } from 'lucide-react';

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden fade-in-section">
      <div className="mesh-grid absolute inset-0 opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-900/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl"></div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-1.5 bg-gray-800 rounded-full mb-6 border border-violet-500/20">
            <Sparkles className="h-4 w-4 text-violet-400 mr-2" />
            <span className="text-sm font-medium text-gray-300">
              About selfinterview AI+
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl mb-6 leading-tight">
            <span className="gradient-text">Transform Nerves Into Confidence</span><br />
            <span className="text-indigo-200 font-semibold">— One Interview at a Time</span>
          </h2>
          <div className="mt-8 max-w-2xl mx-auto text-lg text-gray-300 space-y-6">
            <p>
              <span className="text-violet-400 font-bold">Have you ever felt your heart race before an interview?</span> <br />
              Or wished you could practice your answers out loud, but didn't know where to start?
            </p>
            <p>
              <span className="text-indigo-300 font-semibold">You're not alone.</span> <br />
              Most people struggle with self-interviewing and the fear of not being "good enough."
              That's why we created <span className="text-violet-400 font-bold">selfinterview AI+</span> — a safe, supportive space to practice, grow, and discover your true potential.
            </p>
            <div className="bg-gradient-to-r from-violet-700/80 to-indigo-700/80 rounded-xl px-6 py-4 my-6 shadow-lg border border-violet-500/20">
              <span className="text-white text-xl font-semibold">"Confidence isn't something you're born with — it's something you build."</span>
            </div>
            <p>
              <span className="text-violet-300 font-semibold">Every session is a step forward.</span> <br />
              Our AI-powered platform helps you:
              <ul className="list-disc list-inside text-left mt-2 text-base text-indigo-100">
                <li>Practice real interview questions, as many times as you need</li>
                <li>Receive instant, actionable feedback</li>
                <li>Grow your skills and self-belief, one answer at a time</li>
              </ul>
            </p>
            <p>
              <span className="text-indigo-200 font-bold">You deserve to walk into your next interview with your head held high.</span> <br />
              Let's turn anxiety into achievement — together.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}; 