/**
 * Input validation and sanitization utilities for production safety
 */

// Sanitize user input to prevent XSS attacks
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// Validate message content
export const validateMessage = (content: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(content);
  
  if (!sanitized || sanitized.length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (sanitized.length > 2000) {
    return { isValid: false, error: 'Message too long (max 2000 characters)' };
  }
  
  // Check for excessive special characters (possible spam)
  const specialCharRatio = (sanitized.match(/[^a-zA-Z0-9\s]/g) || []).length / sanitized.length;
  if (specialCharRatio > 0.5) {
    return { isValid: false, error: 'Message contains too many special characters' };
  }
  
  return { isValid: true };
};

// Validate username
export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(username);
  
  if (!sanitized || sanitized.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (sanitized.length > 30) {
    return { isValid: false, error: 'Username too long (max 30 characters)' };
  }
  
  // Only allow alphanumeric, underscore, and hyphen
  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscore, and hyphen' };
  }
  
  return { isValid: true };
};

// Validate email format
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || !emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email address too long' };
  }
  
  return { isValid: true };
};

// Rate limiting utility
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Filter out old attempts
    const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);
    
    // Update the attempts list
    this.attempts.set(identifier, recentAttempts);
    
    return recentAttempts.length >= this.maxAttempts;
  }
  
  recordAttempt(identifier: string): void {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    userAttempts.push(now);
    this.attempts.set(identifier, userAttempts);
  }
}

// Create rate limiter instances
export const messageRateLimiter = new RateLimiter(10, 60000); // 10 messages per minute
export const authRateLimiter = new RateLimiter(5, 300000); // 5 auth attempts per 5 minutes