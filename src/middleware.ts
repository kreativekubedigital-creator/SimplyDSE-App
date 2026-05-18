import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const isLocalhost = hostname.includes('localhost');
  const port = hostname.split(':')[1] || '3000';

  // Resolve ROOT_DOMAIN
  const ROOT_DOMAIN = isLocalhost
    ? `localhost:${port}`
    : (process.env.NEXT_PUBLIC_ROOT_DOMAIN || hostname.split('.').slice(-2).join('.'));

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
            const domain = ROOT_DOMAIN.includes('localhost') ? undefined : `.${ROOT_DOMAIN}`;
            req.cookies.set(name, value);
            res.cookies.set({ name, value, ...options, domain });
          });
        },
      },
    }
  );

  // 1. Instantly bypass Next.js link prefetching to prevent parallel token refresh rate limits (429)
  const isPrefetch = req.headers.get('x-middleware-prefetch') === '1' || 
                     req.headers.get('purpose') === 'prefetch';
  if (isPrefetch) {
    return res;
  }

  // 2. Only invoke Supabase getUser() if auth cookies exist to prevent unnecessary database/API calls for guests
  const allCookies = req.cookies.getAll();
  const hasAuthCookie = allCookies.some(c => c.name.startsWith('sb-') && c.name.includes('-auth-token'));

  let user = null;

  if (hasAuthCookie) {
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch (err) {
      console.error('[middleware] Session check failed:', err);
    }
  }

  // 2. Multi-Workspace Subdomain Resolution
  const url = req.nextUrl;
  const path = url.pathname;

  // Calculate subdomain
  let currentHost = hostname
    .replace(`${ROOT_DOMAIN}`, '')
    .replace(/\.$/, '');

  if (!currentHost || currentHost === 'www') {
    currentHost = 'www';
  }

  // Inject the resolved Workspace slug into headers for server components
  res.headers.set('x-tenant-slug', currentHost);

  // ──────────────────────────────────────────────────
  // 3. Routing & Access Control
  // ──────────────────────────────────────────────────

  // Super Admin Zone (admin.simplydse.online)
  if (currentHost === 'admin') {
    // Auth Check: Must be logged in for everything except /login and /auth
    if (!user && path !== '/login' && !path.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (user) {
      // Fetch user profile securely
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // Non-super admin: redirect back to public marketing portal
      if (!profile || profile.role !== 'super_admin') {
        console.warn('[middleware] Non-super admin attempted to access admin subdomain:', user.email);
        const wwwUrl = new URL('/login?error=Access+Denied:+Super+Admin+only', req.url);
        wwwUrl.hostname = ROOT_DOMAIN.includes('localhost') ? 'localhost' : `www.${ROOT_DOMAIN}`;
        return NextResponse.redirect(wwwUrl);
      }

      // Already authenticated super admin: redirect login/auth paths back to root
      if (path === '/login' || path.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Clean up URLs: If they access admin.domain.com/admin/something, redirect to admin.domain.com/something
    if (path === '/super-admin' || path.startsWith('/super-admin/')) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (path.startsWith('/admin')) {
      return NextResponse.redirect(new URL(path.replace(/^\/admin/, '') || '/', req.url));
    }

    // Rewrite admin.domain.com/some-path to /admin/some-path
    // EXEMPT /auth and /login paths
    if (path !== '/login' && !path.startsWith('/auth')) {
      return NextResponse.rewrite(new URL(`/admin${path === '/' ? '' : path}`, req.url));
    }
  }

  // Public Marketing Site (www.simplydse.online or localhost:3000)
  else if (currentHost === 'www') {
    // If an authenticated user tries to access /admin or /dashboard or /employee,
    // we need to allow rewrites to those Next.js routes rather than blocking them.
    
    if (user) {
      // Authenticated user on www — if they're trying to reach a protected route, allow it via rewrite.
      if (path.startsWith('/admin')) {
        // Let Next.js serve the /admin route tree directly (no rewrite needed, it already maps correctly)
        return res;
      }
      if (path === '/super-admin' || path.startsWith('/super-admin/')) {
        return NextResponse.rewrite(new URL(path.replace(/^\/super-admin/, '/admin') || '/admin', req.url));
      }
      if (path.startsWith('/dashboard')) {
        return res;
      }
      if (path.startsWith('/employee')) {
        return res;
      }

      // If authenticated user goes to /login, redirect them to appropriate dashboard
      if (path === '/login') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const hrRoles = ['organisation_admin', 'organization_admin', 'org_admin', 'hr_manager', 'compliance_manager'];

        if (profile?.role === 'super_admin') {
          return NextResponse.redirect(new URL('/super-admin', req.url));
        } else if (profile?.role && hrRoles.includes(profile.role)) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        } else {
          // Default for 'employee', 'user', or missing profile (safe fallback)
          return NextResponse.redirect(new URL('/employee', req.url));
        }
      }
    } else {
      // Unauthenticated user on www trying to access protected routes
      if (path.startsWith('/admin') || path.startsWith('/super-admin') || path.startsWith('/dashboard') || path.startsWith('/employee')) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }
  }

  // Workspace Zone (acme.simplydse.online)
  else {
    // 1. Auth Check
    if (!user && path !== '/login' && !path.startsWith('/auth')) {
      const loginUrl = new URL('/login', req.url);
      if (path !== '/') loginUrl.searchParams.set('next', path);
      return NextResponse.redirect(loginUrl);
    }

    if (user) {
      // 2. Fetch Profile & Resolve Role
      // We use the service role client for middleware to ensure we can always fetch the profile 
      // even if RLS is strict (though RLS should allow self-read).
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, organization_id, organizations!profiles_organization_id_fkey(subdomain)')
        .eq('id', user.id)
        .single();

      // If no profile exists, this is a critical state for a logged-in user
      if (!profile) {
        console.error('Critical: Authenticated user has no profile record', user.id);
        // Fallback to employee hub with minimal access
      }

      const role = profile?.role || 'employee';
      // @ts-ignore
      const userSubdomain = profile?.organizations?.subdomain;

      // 3. Tenant Isolation Check
      // Ensure the user belongs to the organization associated with this subdomain
      if (userSubdomain && userSubdomain !== currentHost) {
        // Log out or redirect to their correct subdomain
        const { error: signOutError } = await supabase.auth.signOut();
        return NextResponse.redirect(new URL(`/login?error=Access Denied: Your account belongs to ${userSubdomain}`, req.url));
      }

      // 4. Resolve Dashboard Prefix
      let dashboardPrefix = '/employee'; // Default
      
      const hrRoles = [
        'organisation_admin', 
        'organization_admin', 
        'org_admin', 
        'hr_admin',
        'admin',
        'hr_manager', 
        'compliance_manager',
        'compliance_admin',
        'org_manager'
      ];
      
      if (hrRoles.includes(role)) {
        dashboardPrefix = '/dashboard';
      } else if (role === 'manager') {
        dashboardPrefix = '/manager';
      } else if (role === 'super_admin') {
        dashboardPrefix = '/dashboard';
      }

      // 5. Path Cleanup & Access Control
      // [REMOVED REDIRECT LOGIC TO PREVENT LOOPS AND 404s]
      // We allow both clean and explicit paths for now to ensure stability.


      // 6. Rewrite to correct internal route
      if (path !== '/login' && !path.startsWith('/auth')) {
        // If the path already starts with the correct prefix, we don't need to rewrite
        // Next.js will handle the explicit path directly.
        if (path.startsWith(dashboardPrefix)) {
          return res;
        }

        // Otherwise, rewrite the clean URL to the internal route
        const finalPath = `${dashboardPrefix}${path === '/' ? '' : path}`;
        return NextResponse.rewrite(new URL(finalPath, req.url));
      }
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
