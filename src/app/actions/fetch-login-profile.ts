'use server';

import { createClient } from '@supabase/supabase-js';
import { ensurePlatformSuperAdminProfile } from '@/lib/platform-admin';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function fetchLoginProfile(userId: string) {
  try {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
    const email = authUser?.user?.email;
    if (email) {
      await ensurePlatformSuperAdminProfile(userId, email);
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role, organization_id, full_name, organizations!profiles_organization_id_fkey(subdomain, name)')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return { success: false, error: error?.message || 'Profile not found' };
    }

    return { success: true, profile };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
