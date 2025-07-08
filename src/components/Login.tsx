import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, ArrowRight, Star, Mail, X } from 'lucide-react';

export default function Login() {
  const { login, loginWithGoogle, loading, error, resendVerificationEmail, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }
    
    try {
      await login(email, password);
      navigate('/home', { replace: true });
    } catch (err: any) {
      // Check if error is about email verification
      if (err.message.includes('verify your email')) {
        setShowResend(true);
      }
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    
    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetEmail('');
    setResetSuccess(false);
  };

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
            <Lock className="h-4 w-4 text-violet-400 mr-2" />
            <span className="text-sm font-medium text-violet-300">Welcome Back!</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to <span className="gradient-text">Ace Your Next Interview</span>?
          </h2>
        </div>

        {/* Social Proof */}
        

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="relative">
            <input
              type="email"
              placeholder="Your email address"
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
              placeholder="Your password"
              className="w-full px-4 py-3 rounded-xl bg-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent border border-gray-600 placeholder-gray-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
            >
              Forgot your password?
            </button>
          </div>

          {error && (
            <div className="text-red-400 text-sm flex items-center p-3 bg-red-900/20 rounded-lg border border-red-500/20">
              <span className="mr-2">⚠</span>
              <div>
                {error}
                {showResend && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="block mt-1 text-violet-400 hover:text-violet-300 underline"
                  >
                    Resend verification email
                  </button>
                )}
              </div>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing you in...
              </>
            ) : (
              <>
                Continue Your Interview Prep
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
          <span className="text-gray-400">Don't have an account? </span>
          <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">Start your free trial</Link>
        </div>

        {/* Quick Stats */}
        
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-violet-500/20 relative">
            <button
              onClick={closeResetModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            {!resetSuccess ? (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center px-4 py-2 bg-violet-900/30 rounded-full mb-4 border border-violet-500/20">
                    <Mail className="h-4 w-4 text-violet-400 mr-2" />
                    <span className="text-sm font-medium text-violet-300">Reset Password</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Forgot Your Password?</h3>
                  <p className="text-gray-300">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 rounded-xl bg-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent border border-gray-600 placeholder-gray-400"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending Reset Link...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <Mail className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="text-green-400 text-6xl mb-4">✓</div>
                <h3 className="text-2xl font-bold text-white mb-4">Check Your Email!</h3>
                <p className="text-gray-300 mb-6">
                  We've sent a password reset link to <span className="text-violet-400 font-semibold">{resetEmail}</span>. 
                  Please check your inbox and follow the instructions to reset your password.
                </p>
                <button
                  onClick={closeResetModal}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 