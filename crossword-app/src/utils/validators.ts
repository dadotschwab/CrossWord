import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// List validation schema
export const createListSchema = z.object({
  name: z.string().min(2, 'List name must be at least 2 characters').max(50, 'List name is too long'),
  target_language: z.string().min(2, 'Please select a target language'),
  source_language: z.string().min(2, 'Please select a source language'),
});

// Word validation schema
export const createWordSchema = z.object({
  word: z.string().min(2, 'Word must be at least 2 characters').max(30, 'Word is too long'),
  definition: z.string().min(2, 'Definition must be at least 2 characters').max(200, 'Definition is too long'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateListFormData = z.infer<typeof createListSchema>;
export type CreateWordFormData = z.infer<typeof createWordSchema>;
