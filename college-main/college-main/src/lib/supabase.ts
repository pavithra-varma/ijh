import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Class = {
  id: string;
  subject_name: string;
  subject_code: string;
  instructor: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room_number: string;
  department: string;
  semester: string;
  created_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string;
  category: string;
  organizer: string | null;
  created_at: string;
};

export type Department = {
  id: string;
  name: string;
  head: string;
  location: string;
  contact_email: string | null;
  contact_phone: string | null;
  description: string | null;
  created_at: string;
};

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  created_at: string;
};
