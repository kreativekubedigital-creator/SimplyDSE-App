import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getCookieDomain(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  const hostname = window.location.hostname;

  // On localhost, do NOT set a domain — let the browser handle it naturally.
  // Setting ".localhost" or "localhost" is rejected by most browsers.
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return undefined;
  }

  // On production (e.g. acme.simplydse.online), set the domain to
  // ".simplydse.online" so the cookie is shared across all subdomains
  // (www, admin, acme, etc.)
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join('.')}`;
  }

  return undefined;
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookieOptions: {
    domain: getCookieDomain(),
    path: '/',
    sameSite: 'lax',
    // Only set secure flag when on HTTPS (production).
    // On localhost (HTTP), secure cookies are rejected by browsers.
    secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  }
});
