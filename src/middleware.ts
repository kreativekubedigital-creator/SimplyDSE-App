import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';

  // Resolve ROOT_DOMAIN
  const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    (hostname.includes('localhost') ? 'localhost:3000' : hostname.split('.').slice(-2).join('.'));

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
            const domain = ROOT_DOMAIN === 'localhost:3000' ? undefined : `.${ROOT_DOMAIN}`;
            req.cookies.set(name, value);
            res.cookies.set({ name, value, ...options, domain });
          });
        },
      },
    }
  );

  // 1. Refresh session if active
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Multi-Workspace Subdomain Resolution
  const url = req.nextUrl;
  const path = url.pathname;

  // Calculate subdomain
  let currentHost = hostname
    .replace(`localhost:3000`, '')
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

    // Clean up URLs: If they access admin.domain.com/admin/something, redirect to admin.domain.com/something
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
          return NextResponse.redirect(new URL('/admin', req.url));
        } else if (profile?.role && hrRoles.includes(profile.role)) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        } else {
          // Default for 'employee', 'user', or missing profile (safe fallback)
          return NextResponse.redirect(new URL('/employee', req.url));
        }
      }
    } else {
      // Unauthenticated user on www trying to access protected routes
      if (path.startsWith('/admin') || path.startsWith('/dashboard') || path.startsWith('/employee')) {
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
        return NextResponse.rewrite(new URL(`${dashboardPrefix}${path === '/' ? '' : path}`, req.url));
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
