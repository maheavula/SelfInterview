import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Signup() {
  const { signup, loginWithGoogle, loading, error, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }
    
    try {
      await signup(email, password);
      setSignupSuccess(true);
      setShowResend(true);
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/home', { replace: true });
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      setShowResend(false);
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border border-violet-500/20 relative z-10">
          <div className="text-green-400 text-6xl mb-4 animate-bounce">✓</div>
          <h2 className="text-2xl font-bold mb-6 text-violet-400">Welcome to PrepWise AI+!</h2>
          <p className="text-gray-300 mb-6">
            We've sent a verification email to <span className="text-violet-400 font-semibold">{email}</span>. 
            Please check your inbox and click the verification link to start your interview preparation journey.
          </p>
          {showResend && (
            <button
              onClick={handleResendVerification}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 mb-4"
            >
              Resend Verification Email
            </button>
          )}
          <Link
            to="/login"
            className="block w-full bg-gray-700/50 hover:bg-gray-600/50 text-white font-semibold py-3 rounded-xl transition-all duration-300 border border-gray-600 hover:border-violet-500/50"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-violet-500/20 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-violet-900/30 rounded-full mb-4 border border-violet-500/20">
            <Sparkles className="h-4 w-4 text-violet-400 mr-2" />
            <span className="text-sm font-medium text-violet-300">Register Now</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">
            Stop Losing Dream Jobs to <span className="gradient-text">Interview Anxiety</span>
          </h2>
        </div>

        {/* Benefits */}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="relative">
            <input
              type="email"
              placeholder="Your professional email"
              className="w-full px-4 py-3 rounded-xl bg-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent border border-gray-600 placeholder-gray-400"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="Create a strong password (8+ characters)"
              className="w-full px-4 py-3 rounded-xl bg-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent border border-gray-600 placeholder-gray-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={8}
            />
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="Confirm your password"
              className="w-full px-4 py-3 rounded-xl bg-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent border border-gray-600 placeholder-gray-400"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          {password && confirmPassword && password !== confirmPassword && (
            <div className="text-red-400 text-sm flex items-center">
              <span className="mr-2">⚠</span>
              Passwords do not match
            </div>
          )}
          {error && <div className="text-red-400 text-sm flex items-center">
            <span className="mr-2">⚠</span>
            {error}
          </div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={loading || password !== confirmPassword}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Your Account...
              </>
            ) : (
              <>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800/50 text-gray-400">or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-all duration-300 border border-gray-600 hover:border-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C36.13 2.7 30.45 0 24 0 14.82 0 6.73 5.8 2.69 14.09l7.98 6.2C12.13 13.13 17.56 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.93 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.29c-1.13-3.36-1.13-6.97 0-10.33l-7.98-6.2C.9 15.1 0 19.41 0 24c0 4.59.9 8.9 2.69 12.24l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.45 0 12.13-2.13 16.19-5.81l-7.19-5.59c-2.01 1.35-4.59 2.15-7.19 2.15-6.44 0-11.87-3.63-14.33-8.89l-7.98 6.2C6.73 42.2 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
          Continue with Google
        </button>

        <div className="mt-6 text-center">
          <span className="text-gray-400">Already have an account? </span>
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">Sign in here</Link>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
} 