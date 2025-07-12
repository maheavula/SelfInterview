import { useState, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

// Domain restrictions - you can customize this list
const ALLOWED_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'protonmail.com',
  'veltech.edu.in', // Veltech University domain
  'company.com', // Add your company domain
  'yourdomain.com' // Add other legitimate domains
  
];

const BLOCKED_DOMAINS = [
  'tempmail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
  'temp-mail.org',
  'fakeinbox.com',
  'throwaway.email',
  'disposablemail.com'
];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Optimize auth state listener
  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!mounted) return;
      
      setUser(user);
      // Set user email in sessionStorage for interview feedback tracking
      if (user?.email) {
        sessionStorage.setItem('userEmail', user.email);
      } else {
        sessionStorage.removeItem('userEmail');
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Memoize email validation
  const validateEmailDomain = useCallback((email: string): { isValid: boolean; message?: string } => {
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (!domain) {
      return { isValid: false, message: 'Invalid email format' };
    }

    // Check blocked domains
    if (BLOCKED_DOMAINS.includes(domain)) {
      return { isValid: false, message: 'Temporary/disposable email addresses are not allowed' };
    }

    // Check allowed domains (if you want to restrict to specific domains)
    if (ALLOWED_DOMAINS.length > 0 && !ALLOWED_DOMAINS.includes(domain)) {
      return { isValid: false, message: 'Please use a legitimate email address from a recognized provider' };
    }

    return { isValid: true };
  }, []);

  // Optimize login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Validate email domain
      const domainValidation = validateEmailDomain(email);
      if (!domainValidation.isValid) {
        throw new Error(domainValidation.message);
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!result.user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email address before logging in. Check your inbox for a verification link.');
      }

      // Welcome email removed - now only used for feedback notifications

      return result.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [validateEmailDomain]);

  // Optimize signup function
  const signup = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      // Validate email domain
      const domainValidation = validateEmailDomain(email);
      if (!domainValidation.isValid) {
        throw new Error(domainValidation.message);
      }

      // Additional password validation
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      await sendEmailVerification(result.user);
      
      // Sign out the user until they verify their email
      await signOut(auth);
      
      throw new Error('Account created successfully! Please check your email and verify your account before logging in.');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [validateEmailDomain]);

  // Optimize Google login
  const loginWithGoogle = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await signInWithPopup(auth, googleProvider);
      
      // Google accounts are typically verified, but you can add additional checks here
      const email = result.user.email;
      if (email) {
        const domainValidation = validateEmailDomain(email);
        if (!domainValidation.isValid) {
          await signOut(auth);
          throw new Error(domainValidation.message);
        }
        // Welcome email removed - now only used for feedback notifications
      }
      
      return result.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [validateEmailDomain]);

  // Optimize logout function
  const logout = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimize resend verification
  const resendVerificationEmail = useCallback(async () => {
    try {
      setError(null);
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        setError('Verification email sent! Please check your inbox.');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user]);

  // Optimize password reset
  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      setLoading(true);

      // Validate email domain
      const domainValidation = validateEmailDomain(email);
      if (!domainValidation.isValid) {
        throw new Error(domainValidation.message);
      }

      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent! Please check your inbox and follow the instructions.');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [validateEmailDomain]);

  return {
    user,
    loading,
    error,
    login,
    signup,
    loginWithGoogle,
    logout,
    resendVerificationEmail,
    resetPassword,
  };
}; 