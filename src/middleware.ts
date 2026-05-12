import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Define the root domain from env or default to simplydse.com
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'simplydse.com';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  // 1. Refresh session if active
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Multi-Workspace Subdomain Resolution
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Calculate subdomain:
  // e.g. "acme.simplydse.com" -> "acme"
  // e.g. "admin.simplydse.com" -> "admin"
  // e.g. "simplydse.com" -> "" or "www"
  // e.g. "localhost:3000" -> "localhost"
  
  let currentHost = hostname
    .replace(`.localhost:3000`, '')
    .replace(`.${ROOT_DOMAIN}`, '');

  if (currentHost === hostname) {
    // No subdomain found
    currentHost = 'www';
  }

  // Inject the resolved Workspace slug into headers for server components
  res.headers.set('x-tenant-slug', currentHost);

  const path = url.pathname;

  // 3. Routing & Access Control
  // ----------------------------------------------------
  
  // Super Admin Zone
  if (currentHost === 'admin') {
    // If not on an admin route, rewrite to /admin
    // (If the app uses /admin path inside Next.js pages)
    if (!path.startsWith('/admin') && path !== '/login') {
       // We let them access the /admin path. If they try to go to the root on admin.domain.com,
       // redirect them to /admin.
       if (path === '/') {
         return NextResponse.redirect(new URL('/admin', req.url));
       }
    }
    
    // Auth Check: Super Admins only
    if (!user && path !== '/login') {
       return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // If logged in, you could optionally verify their role here or in the layout
  } 
  
  // Public Marketing Site
  else if (currentHost === 'www') {
    // Don't block access, standard marketing pages
    if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  } 
  
  // Workspace Workspace Zone
  else {
    // It's a Workspace (e.g. acme.simplydse.com)
    
    // Auth Check
    if (!user && path !== '/login') {
       // Save intended URL for redirect after login
       const loginUrl = new URL('/login', req.url);
       loginUrl.searchParams.set('next', path);
       return NextResponse.redirect(loginUrl);
    }
    
    // Optional: Cross-Workspace Isolation
    // In a production scenario, you would verify the user.organization_id matches the tenant_slug.
    // For now, the DB RLS handles the heavy lifting, but middleware can enforce basic routing.
    
    if (path === '/') {
       // Redirect to their dashboard
       return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets like SVG, PNG, JPG, MP4
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|css|js)).*)',
  ],
};
