import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Credentials from User
const SUPABASE_URL = 'https://pnrfjfvagwlxfxzucdhp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucmZqZnZhZ3dseGZ4enVjZGhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDc4NzAsImV4cCI6MjA4NzA4Mzg3MH0.gsf2qA0LK0X2R7bA41qTZAIk9Xi3tPpwmwa5T6sJhII';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
