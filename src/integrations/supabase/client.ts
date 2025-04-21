
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://uqojhqvqrhgxrerxhzwy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxb2pocXZxcmhneHJlcnhoend5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTIxMzUsImV4cCI6MjA2MDgyODEzNX0.Fdik9yqyOQRF5-3MyXjIXB6yOj_NjHYuK6FaqtaD0Ik";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
