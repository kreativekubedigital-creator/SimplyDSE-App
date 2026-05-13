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
  // e.g. "acme.simplydse.online" -> "acme"
  // e.g. "admin.simplydse.online" -> "admin"
  // e.g. "localhost:3000" -> "www"
  
  let currentHost = hostname
    .replace(`localhost:3000`, '')
    .replace(`${ROOT_DOMAIN}`, '')
    .replace(/\.$/, ''); // Remove trailing dot if it exists

  if (!currentHost || currentHost === 'www') {
    currentHost = 'www';
  }

  // Inject the resolved Workspace slug into headers for server components
  res.headers.set('x-tenant-slug', currentHost);

  const path = url.pathname;

  // 3. Routing & Access Control (Rewrites)
  // ----------------------------------------------------
  
  // Super Admin Zone (admin.simplydse.com)
  if (currentHost === 'admin') {
    // Auth Check: Super Admins only
    if (!user && path !== '/login') {
       return NextResponse.redirect(new URL('/login', req.url));
    }

    // Clean up URLs: If they access admin.domain.com/admin/something, redirect to admin.domain.com/something
    if (path.startsWith('/admin')) {
      return NextResponse.redirect(new URL(path.replace(/^\/admin/, ''), req.url));
    }

    // Rewrite admin.domain.com/some-path to /admin/some-path
    // EXEMPT /auth paths so callback works!
    if (path !== '/login' && !path.startsWith('/auth')) {
      return NextResponse.rewrite(new URL(`/admin${path === '/' ? '' : path}`, req.url));
    }
  } 
  
  // Public Marketing Site (www.simplydse.online)
  else if (currentHost === 'www') {
    if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  } 
  
  // Workspace Zone (acme.simplydse.online)
  else {
    // Auth Check
    if (!user && path !== '/login' && !path.startsWith('/auth')) {
       const loginUrl = new URL('/login', req.url);
       if (path !== '/') loginUrl.searchParams.set('next', path);
       return NextResponse.redirect(loginUrl);
    }

    // Clean up URLs: If they access acme.domain.com/dashboard/something, redirect to acme.domain.com/something
    if (path.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL(path.replace(/^\/dashboard/, ''), req.url));
    }
    
    // Rewrite acme.domain.com/some-path to /dashboard/some-path
    // EXEMPT /auth paths
    if (path !== '/login' && !path.startsWith('/auth')) {
      return NextResponse.rewrite(new URL(`/dashboard${path === '/' ? '' : path}`, req.url));
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
