import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookieOptions: {
    domain: typeof window !== 'undefined' ? `.${window.location.hostname.split('.').slice(-2).join('.')}` : undefined,
    path: '/',
    sameSite: 'lax',
    secure: true,
  }
});
