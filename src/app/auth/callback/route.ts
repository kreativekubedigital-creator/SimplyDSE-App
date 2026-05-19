import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { linkSSOEmployee } from '@/lib/auth-linker';
import { logSSOEvent } from '@/lib/audit-logger';
import { ensurePlatformSuperAdminProfile } from '@/lib/platform-admin';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost');
  const port = host.split(':')[1] || '3000';
  const ROOT_DOMAIN = isLocalhost
    ? `localhost:${port}`
    : (process.env.NEXT_PUBLIC_ROOT_DOMAIN || host.split('.').slice(-2).join('.'));

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                const domain = ROOT_DOMAIN.includes('localhost') ? undefined : `.${ROOT_DOMAIN}`;
                cookieStore.set(name, value, { ...options, domain });
              });
            } catch {
              // Server Component context — middleware handles this
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[auth/callback] exchangeCodeForSession failed:', {
        message: error.message,
        status: error.status,
        code: error.code,
      });
      let errorParam = 'Authentication+failed.+Please+try+again.';
      if (error.message.includes('expired') || error.message.includes('flow_state_not_found') || error.message.includes('Token has expired') || error.message.includes('invalid_grant')) {
        errorParam = 'Reset+link+expired';
      }
      
      const redirectUrl = (next === '/reset-password' || next?.startsWith('/reset-password'))
        ? `${origin}/reset-password?error=${errorParam}`
        : `${origin}/login?error=${errorParam}`;
        
      return NextResponse.redirect(redirectUrl);
    }

    const { data: { user } } = await supabase.auth.getUser();

      if (user && user.email) {
        await ensurePlatformSuperAdminProfile(user.id, user.email);

        // Run the linker for potential SSO users
        const linkResult = await linkSSOEmployee(user.id, user.email);
        
        // Fetch refreshed profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, organization_id, organizations!profiles_organization_id_fkey(subdomain)')
          .eq('id', user.id)
          .single();

        if (profile?.organization_id) {
          await logSSOEvent({
            organizationId: profile.organization_id,
            userId: user.id,
            action: 'sso_login_success',
            details: { method: 'sso', email: user.email }
          });
        }

        const role = profile?.role;
        // @ts-ignore
        const subdomain = profile?.organizations?.subdomain;
        let targetOrigin = origin;

        // Dynamic domain mapping based on user role and organization subdomain
        if (role === 'super_admin') {
          const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'simplydse.online';
          const urlObj = new URL(origin);
          if (urlObj.hostname !== 'localhost' && !urlObj.hostname.endsWith('.localhost')) {
            urlObj.hostname = rootDomain;
          }
          targetOrigin = urlObj.origin;
        } else if (subdomain && subdomain !== 'www') {
          const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'simplydse.online';
          const urlObj = new URL(origin);
          if (urlObj.hostname === 'localhost' || urlObj.hostname.endsWith('.localhost')) {
            urlObj.hostname = `${subdomain}.localhost`;
          } else {
            urlObj.hostname = `${subdomain}.${rootDomain}`;
          }
          targetOrigin = urlObj.origin;
        }

        // If a specific next URL was provided, use it
        if (next) {
          return NextResponse.redirect(`${targetOrigin}${next}`);
        }

        if (role === 'super_admin') {
          return NextResponse.redirect(`${targetOrigin}/super-admin`);
        } else if (['organisation_admin', 'organization_admin', 'org_admin', 'hr_manager', 'compliance_manager'].includes(role || '')) {
          return NextResponse.redirect(`${targetOrigin}/dashboard`);
        } else {
          return NextResponse.redirect(`${targetOrigin}/employee`);
        }
      }

      // Fallback
      return NextResponse.redirect(`${origin}/dashboard`);
    }

    // Return the user to an error page with some instructions
    return NextResponse.redirect(`${origin}/login?error=Authentication+failed.+Please+try+again.`);
}
