import { z } from 'zod';
import DOMPurify from 'dompurify';
import validator from 'validator';

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  // Basic escaping and sanitization
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML allowed
    ALLOWED_ATTR: [],
  }).trim();
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

// Validate phone number
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field in some forms
  return validator.isMobilePhone(phone, 'any', { strictMode: false });
};

// Zod schema for Contact Form
export const contactFormSchema = z.object({
  service: z.string().min(1, 'Service is required'),
  business: z.string().min(1, 'Business type is required'),
  budget: z.string().min(1, 'Budget is required'),
  timeline: z.string().min(1, 'Timeline is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().max(2000, 'Message is too long').optional(),
  honeypot: z.string().max(0, 'Spam detected').optional(), // Must be empty
});

// Zod schema for simple contact (email only)
export const simpleContactSchema = z.object({
  email: z.string().email('Invalid email address'),
});
