// Input sanitization utilities to prevent XSS attacks

// HTML entities mapping
const HTML_ENTITIES: { [key: string]: string } = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

// Sanitize HTML content
export const sanitizeHTML = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[&<>"'`=\/]/g, (char) => HTML_ENTITIES[char] || char)
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

// Sanitize text content (removes all HTML)
export const sanitizeText = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/[&<>"'`=\/]/g, (char) => HTML_ENTITIES[char] || char)
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

// Sanitize URLs
export const sanitizeURL = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  const url = input.trim();
  
  // Check for valid URL scheme
  const validSchemes = ['http:', 'https:', 'mailto:', 'tel:'];
  const urlObj = new URL(url, window.location.href);
  
  if (!validSchemes.includes(urlObj.protocol)) {
    return '';
  }

  return url;
};

// Sanitize email addresses
export const sanitizeEmail = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  const email = input.trim().toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return '';
  }

  return email;
};

// Sanitize API keys (basic format validation)
export const sanitizeApiKey = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  const key = input.trim();
  
  // Basic API key validation (adjust based on your API key format)
  const apiKeyRegex = /^[A-Za-z0-9_-]{20,}$/;
  
  if (!apiKeyRegex.test(key)) {
    return '';
  }

  return key;
};

// Sanitize form inputs
export const sanitizeFormInput = (input: string, type: 'text' | 'email' | 'url' | 'textarea' = 'text'): string => {
  if (typeof input !== 'string') {
    return '';
  }

  switch (type) {
    case 'email':
      return sanitizeEmail(input);
    case 'url':
      return sanitizeURL(input);
    case 'textarea':
      return sanitizeText(input);
    default:
      return sanitizeHTML(input);
  }
};

// Sanitize object properties
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeHTML(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
};

// Sanitize array of strings
export const sanitizeArray = (arr: string[]): string[] => {
  if (!Array.isArray(arr)) {
    return [];
  }
  
  return arr.map(item => sanitizeHTML(String(item)));
};

// Validate and sanitize JSON input
export const sanitizeJSON = (input: string): any => {
  try {
    const parsed = JSON.parse(input);
    return sanitizeObject(parsed);
  } catch (error) {
    console.error('Invalid JSON input:', error);
    return null;
  }
};

// Sanitize user input for display
export const sanitizeForDisplay = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[&<>"'`=\/]/g, (char) => HTML_ENTITIES[char] || char);
};

// Sanitize input for database storage
export const sanitizeForStorage = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// Validate input length
export const validateInputLength = (input: string, maxLength: number = 1000): boolean => {
  return typeof input === 'string' && input.length <= maxLength;
};

// Comprehensive input validation and sanitization
export const validateAndSanitize = (input: string, options: {
  type?: 'text' | 'email' | 'url' | 'textarea';
  maxLength?: number;
  required?: boolean;
  allowHTML?: boolean;
} = {}): { isValid: boolean; sanitized: string; error?: string } => {
  const {
    type = 'text',
    maxLength = 1000,
    required = false,
    allowHTML = false
  } = options;

  // Check if required
  if (required && (!input || input.trim().length === 0)) {
    return {
      isValid: false,
      sanitized: '',
      error: 'This field is required'
    };
  }

  // Check length
  if (!validateInputLength(input, maxLength)) {
    return {
      isValid: false,
      sanitized: '',
      error: `Input must be ${maxLength} characters or less`
    };
  }

  // Sanitize based on type
  let sanitized = '';
  switch (type) {
    case 'email':
      sanitized = sanitizeEmail(input);
      if (!sanitized) {
        return {
          isValid: false,
          sanitized: '',
          error: 'Please enter a valid email address'
        };
      }
      break;
    case 'url':
      sanitized = sanitizeURL(input);
      if (!sanitized) {
        return {
          isValid: false,
          sanitized: '',
          error: 'Please enter a valid URL'
        };
      }
      break;
    case 'textarea':
      sanitized = allowHTML ? sanitizeHTML(input) : sanitizeText(input);
      break;
    default:
      sanitized = allowHTML ? sanitizeHTML(input) : sanitizeText(input);
  }

  return {
    isValid: true,
    sanitized
  };
};

// React hook for input sanitization
export const useInputSanitization = () => {
  const sanitizeInput = (value: string, type: 'text' | 'email' | 'url' | 'textarea' = 'text') => {
    return sanitizeFormInput(value, type);
  };

  const validateInput = (value: string, options: any = {}) => {
    return validateAndSanitize(value, options);
  };

  return { sanitizeInput, validateInput };
}; 