import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  'https://mrfjonuewjnmxidtqyyg.supabase.co';

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yZmpvbnVld2pubXhpZHRxeXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDQ0ODEsImV4cCI6MjA5MjI4MDQ4MX0.iL1f7iYYfBuMlTMp4Rrofjyl7Re-wDkBg8EKSsyufik';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
