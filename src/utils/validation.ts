// Input validation and sanitization utilities

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  sanitizedValue?: string;
}

// Sanitize HTML content to prevent XSS
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate and sanitize text input
export const validateTextInput = (input: string, maxLength: number = 1000): ValidationResult => {
  if (!input || typeof input !== 'string') {
    return { isValid: false, message: 'Input is required' };
  }

  if (input.length > maxLength) {
    return { isValid: false, message: `Input must be less than ${maxLength} characters` };
  }

  // Check for potentially malicious content
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      return { isValid: false, message: 'Input contains potentially harmful content' };
    }
  }

  const sanitized = sanitizeHtml(input.trim());
  return { isValid: true, sanitizedValue: sanitized };
};

// Validate email format and domain
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email is required' };
  }

  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return { isValid: false, message: 'Invalid email format' };
  }

  // Blocked domains (temporary/disposable emails)
  const blockedDomains = [
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

  if (blockedDomains.includes(domain)) {
    return { isValid: false, message: 'Temporary/disposable email addresses are not allowed' };
  }

  return { isValid: true, sanitizedValue: email.toLowerCase().trim() };
};

// Validate password strength
export const validatePassword = (password: string): ValidationResult => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' };
  }

  // Check for common weak passwords
  const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (weakPasswords.includes(password.toLowerCase())) {
    return { isValid: false, message: 'Please choose a stronger password' };
  }

  return { isValid: true };
};

// Validate resume text
export const validateResumeText = (text: string): ValidationResult => {
  if (!text || typeof text !== 'string') {
    return { isValid: false, message: 'Resume text is required' };
  }

  if (text.length < 50) {
    return { isValid: false, message: 'Resume text must be at least 50 characters long' };
  }

  if (text.length > 10000) {
    return { isValid: false, message: 'Resume text must be less than 10,000 characters' };
  }

  const sanitized = sanitizeHtml(text.trim());
  return { isValid: true, sanitizedValue: sanitized };
};

// Validate job description
export const validateJobDescription = (text: string): ValidationResult => {
  if (!text) {
    return { isValid: true, sanitizedValue: '' }; // Optional field
  }

  if (typeof text !== 'string') {
    return { isValid: false, message: 'Invalid job description format' };
  }

  if (text.length > 5000) {
    return { isValid: false, message: 'Job description must be less than 5,000 characters' };
  }

  const sanitized = sanitizeHtml(text.trim());
  return { isValid: true, sanitizedValue: sanitized };
};

// Rate limiting utility
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
} 