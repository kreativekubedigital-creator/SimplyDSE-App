import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { linkSSOEmployee } from '@/lib/auth-linker';
import { logSSOEvent } from '@/lib/audit-logger';
import { ensurePlatformSuperAdminProfile } from '@/lib/platform-admin';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') || 'recovery';
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const next = searchParams.get('next');

  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost');
  const port = host.split(':')[1] || '3000';
  const ROOT_DOMAIN = isLocalhost
    ? `localhost:${port}`
    : (process.env.NEXT_PUBLIC_ROOT_DOMAIN || host.split('.').slice(-2).join('.'));

  // Intercept recovery flow immediately and redirect to client-side page
  // This prevents the email scanner from doing the GET request code exchange
  if (type === 'recovery' || next === '/reset-password' || next?.startsWith('/reset-password')) {
    console.info('[auth/callback] Intercepting recovery flow to prevent server-side code consumption by email scanners.');
    const destUrl = new URL(`${origin}/reset-password`);
    if (code) destUrl.searchParams.set('code', code);
    if (tokenHash) destUrl.searchParams.set('token_hash', tokenHash);
    if (accessToken) destUrl.searchParams.set('access_token', accessToken);
    if (refreshToken) destUrl.searchParams.set('refresh_token', refreshToken);
    return NextResponse.redirect(destUrl.toString());
  }

  console.info('[auth/callback] GET request received:', {
    hasCode: !!code,
    hasTokenHash: !!tokenHash,
    hasTokens: !!(accessToken && refreshToken),
    type,
    hasNext: !!next,
    nextValue: next,
    hostname: host,
    origin: origin,
    ROOT_DOMAIN: ROOT_DOMAIN
  });

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

  let success = false;
  let flowError: any = null;

  try {
    if (code) {
      console.info('[auth/callback] Exchanging PKCE code for session...');
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        flowError = error;
      } else {
        success = true;
      }
    } else if (tokenHash) {
      console.info('[auth/callback] Verifying OTP token hash...');
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as any
      });
      if (error) {
        flowError = error;
      } else {
        success = true;
      }
    } else if (accessToken && refreshToken) {
      console.info('[auth/callback] Setting session from query parameters...');
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      if (error) {
        flowError = error;
      } else {
        success = true;
      }
    } else {
      // Check if there is already an active session from cookies
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.info('[auth/callback] Active session already exists from cookies.');
        success = true;
      } else {
        console.warn('[auth/callback] No authentication method or session detected in request.');
        flowError = new Error('No authentication session could be verified.');
      }
    }
  } catch (err: any) {
    console.error('[auth/callback] Unexpected processing error:', err);
    flowError = err;
  }

  if (flowError) {
    console.error('[auth/callback] Verification failed:', {
      message: flowError.message,
      status: flowError.status || 'unknown',
      code: flowError.code || 'unknown',
    });
    let errorParam = 'Authentication+failed.+Please+try+again.';
    if (flowError.message.includes('expired') || flowError.message.includes('flow_state_not_found') || flowError.message.includes('Token has expired') || flowError.message.includes('invalid_grant')) {
      errorParam = 'Reset+link+expired';
    }
    
    const safeErrorMsg = encodeURIComponent(flowError.message || 'unknown');
    const redirectUrl = (next === '/reset-password' || next?.startsWith('/reset-password'))
      ? `${origin}/reset-password?error=${errorParam}&original_error=${safeErrorMsg}`
      : `${origin}/login?error=${errorParam}&original_error=${safeErrorMsg}`;
      
    console.info('[auth/callback] Redirecting to error destination:', redirectUrl);
    return NextResponse.redirect(redirectUrl);
  }

  // Retrieve user if verification succeeded
  const { data: { user } } = await supabase.auth.getUser();

  if (user && user.email) {
    await ensurePlatformSuperAdminProfile(user.id, user.email);

    // Run the linker for potential SSO users
    await linkSSOEmployee(user.id, user.email);
    
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
  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/dashboard`);
}
