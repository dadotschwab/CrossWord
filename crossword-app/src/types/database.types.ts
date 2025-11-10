// Database-related types (will be used with Supabase later)

export interface User {
  id: string;
  email: string;
  is_premium: boolean;
  trial_ends_at: string;
  stripe_customer_id?: string;
  created_at: string;
}

export interface List {
  id: string;
  user_id: string;
  name: string;
  target_language: string;
  source_language: string;
  created_at: string;
  updated_at: string;
}

export interface Word {
  id: string;
  list_id: string;
  word: string;
  definition: string;
  language: string;
  created_at: string;
}

export interface UserWordProgress {
  user_id: string;
  word_id: string;
  due_date: string;
  ease_factor: number;
  interval_days: number;
  consecutive_correct: number;
  last_reviewed: string;
  total_reviews: number;
}

export interface PuzzleSession {
  id: string;
  user_id: string;
  list_id: string;
  created_at: string;
  completed_at?: string;
  words_used: string[];
}
