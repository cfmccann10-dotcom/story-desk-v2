import { createClient } from '@supabase/supabase-js';

// Use correct Supabase project credentials
const supabaseUrl = 'https://lyuwrypprvpcbfglgwts.supabase.co';
const supabaseAnonKey = 'sb_publishable_U77doIlcayVjSUk-JmP9SA_h_kND8-6';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
