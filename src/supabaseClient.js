import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fmrjhvsqhnfbucwbhphn.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcmpodnNxaG5mYnVjd2JocGhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NTA0MTUsImV4cCI6MjA5ODQyNjQxNX0.STnIEV-PBJjpv4vNRg5YJ4DQfNZEZtMeujf7nboQ6qQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
