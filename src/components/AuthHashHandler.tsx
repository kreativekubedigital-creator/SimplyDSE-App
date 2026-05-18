'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (!hash) return;

    // Parse hash parameters
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const type = params.get('type');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      console.error('[AuthHashHandler] Error in hash fragment:', error, errorDescription);
      // Clean the hash first to prevent infinite loop
      window.location.hash = '';
      
      let friendlyMessage = 'This recovery or authentication link is invalid or has expired. Please request a new one.';
      if (errorDescription) {
        friendlyMessage = decodeURIComponent(errorDescription).replace(/\+/g, ' ');
      }
      
      router.push(`/login?error=${encodeURIComponent(friendlyMessage)}`);
      return;
    }

    if (accessToken) {
      console.info('[AuthHashHandler] Detected access token in hash fragment. Type:', type);
      // Clean the hash to prevent re-processing
      window.location.hash = '';

      if (type === 'recovery') {
        console.info('[AuthHashHandler] Password recovery session established. Redirecting to reset-password.');
        router.push('/reset-password');
      } else {
        // For magic links or general sign-in
        console.info('[AuthHashHandler] Successful sign-in. Resolving role and redirecting...');
        
        const resolveAndRedirect = async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              router.push('/login?error=Unable+to+retrieve+authenticated+user.');
              return;
            }

            // Fetch profile
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role, organization_id, organizations!profiles_organization_id_fkey(subdomain)')
              .eq('id', user.id)
              .single();

            if (profileError || !profile) {
              router.push('/login?error=Unable+to+load+your+profile.+Please+contact+your+administrator.');
              return;
            }

            const role = profile.role;
            const hrRoles = ['organisation_admin', 'organization_admin', 'org_admin', 'hr_manager', 'compliance_manager'];

            if (role === 'super_admin') {
              // Redirect to super admin dashboard
              const adminUrl = new URL(window.location.href);
              const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'simplydse.online';
              if (adminUrl.hostname !== 'localhost' && !adminUrl.hostname.endsWith('.localhost')) {
                adminUrl.hostname = `admin.${rootDomain}`;
                window.location.href = adminUrl.origin + '/';
              } else {
                router.push('/super-admin');
              }
            } else if (hrRoles.includes(role || '')) {
              router.push('/dashboard');
            } else {
              router.push('/employee');
            }
          } catch (err) {
            console.error('[AuthHashHandler] Redirect resolution failed:', err);
            router.push('/dashboard');
          }
        };

        resolveAndRedirect();
      }
    }
  }, [router]);

  return null;
}
