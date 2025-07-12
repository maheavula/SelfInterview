import React, { useState } from 'react';
import { BrainCircuit, Star, X, Send, MessageSquare } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import emailjs from '@emailjs/browser';


interface FeedbackData {
  interviewExperience: number;
  aiQuestionQuality: number;
  userInterface: number;
  overallSatisfaction: number;
  experienceText: string;
  timestamp: string;
  userEmail?: string;
}

export default function Feedback({ onClose }: { onClose: () => void }) {
  const [ratings, setRatings] = useState({
    interviewExperience: 0,
    aiQuestionQuality: 0,
    userInterface: 0,
    overallSatisfaction: 0
  });
  const [experienceText, setExperienceText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleStarClick = (category: keyof typeof ratings, rating: number) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
  };

  const renderStars = (category: keyof typeof ratings, currentRating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(category, star)}
            className="transition-all duration-200 hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${
                star <= currentRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-400'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if at least one rating is provided
    const hasRating = Object.values(ratings).some(rating => rating > 0);
    if (!hasRating) {
      alert('Please provide at least one rating before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData: FeedbackData = {
        ...ratings,
        experienceText: experienceText.trim(),
        timestamp: new Date().toISOString(),
        userEmail: sessionStorage.getItem('userEmail') || undefined
      };

      // Save to Firestore
      await addDoc(collection(db, 'userFeedback'), feedbackData);

      // Try to send email notification (optional - don't fail if email fails)
      try {
        // Debug: Log environment variables
        console.log('EmailJS Config:', {
          serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
          templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_5ij2xy6',
          publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? 'SET' : 'NOT SET'
        });

        // Generate star ratings for EmailJS template
        const getStarRating = (rating: number) => {
          return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
        };

        const emailData = {
          name: 'SelfInterview AI+ Feedback System',
          email: feedbackData.userEmail || 'anonymous@selfinterview.ai',
          subject: 'New User Feedback Received - SelfInterview AI+',
          time: new Date().toLocaleString(),
          // Send only the individual variables for EmailJS template
          interviewExperience: ratings.interviewExperience.toString(),
          interviewExperience_stars: getStarRating(ratings.interviewExperience),
          aiQuestionQuality: ratings.aiQuestionQuality.toString(),
          aiQuestionQuality_stars: getStarRating(ratings.aiQuestionQuality),
          userInterface: ratings.userInterface.toString(),
          userInterface_stars: getStarRating(ratings.userInterface),
          overallSatisfaction: ratings.overallSatisfaction.toString(),
          overallSatisfaction_stars: getStarRating(ratings.overallSatisfaction),
          experienceText: experienceText || 'No feedback provided',
          userEmail: feedbackData.userEmail || 'Anonymous',
          timestamp: new Date().toLocaleString()
        };

        console.log('Email data being sent:', emailData);

        console.log('Sending beautiful feedback email with data:', emailData);

        const result = await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_5ij2xy6',
          emailData,
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );

        console.log('Beautiful feedback email sent successfully:', result);
      } catch (emailError: any) {
        console.error('Email notification failed, but feedback was saved:', emailError);
        console.error('Email error details:', {
          name: emailError?.name,
          message: emailError?.message,
          stack: emailError?.stack
        });
        // Don't fail the entire submission if email fails
      }

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-gray-900/95 border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <Send className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-gray-300 mb-4">
            Your feedback has been submitted successfully. We appreciate your input!
          </p>
          <div className="text-sm text-gray-400">
            Closing automatically...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900/95 border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-violet-500 animate-pulse-glow" />
            <h2 className="text-2xl font-bold text-white">Share Your Experience</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interview Experience */}
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">Interview Experience</h3>
            <p className="text-gray-400 text-sm mb-4">
              How was your overall interview experience?
            </p>
            {renderStars('interviewExperience', ratings.interviewExperience)}
          </div>

          {/* AI Question Quality */}
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">AI Question Quality</h3>
            <p className="text-gray-400 text-sm mb-4">
              How relevant and helpful were the AI-generated questions?
            </p>
            {renderStars('aiQuestionQuality', ratings.aiQuestionQuality)}
          </div>

          {/* User Interface */}
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">User Interface</h3>
            <p className="text-gray-400 text-sm mb-4">
              How user-friendly and intuitive was the interface?
            </p>
            {renderStars('userInterface', ratings.userInterface)}
          </div>

          {/* Overall Satisfaction */}
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">Overall Satisfaction</h3>
            <p className="text-gray-400 text-sm mb-4">
              How satisfied are you with the overall experience?
            </p>
            {renderStars('overallSatisfaction', ratings.overallSatisfaction)}
          </div>

          {/* Experience Text */}
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-semibold text-white">Share Your Experience</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Tell us about your interview experience, suggestions, or success story (optional)
            </p>
            <textarea
              value={experienceText}
              onChange={(e) => setExperienceText(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white placeholder-gray-400 resize-none min-h-[120px] focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Share your thoughts, suggestions, or success story..."
              maxLength={1000}
            />
            <div className="text-xs text-gray-400 mt-2 text-right">
              {experienceText.length}/1000 characters
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 via-sky-400 to-purple-500 shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Feedback'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 