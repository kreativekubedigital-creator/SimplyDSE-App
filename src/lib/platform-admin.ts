import { supabaseAdmin } from './supabase-admin';

export const PLATFORM_SUPER_ADMIN_EMAIL = 'kreativekubedigital@gmail.com';

export function isPlatformSuperAdminEmail(email?: string | null) {
  return (email || '').trim().toLowerCase() === PLATFORM_SUPER_ADMIN_EMAIL;
}

export async function ensurePlatformSuperAdminProfile(userId: string, email?: string | null) {
  if (!userId || !isPlatformSuperAdminEmail(email)) {
    return { ensured: false };
  }

  const normalizedEmail = PLATFORM_SUPER_ADMIN_EMAIL;

  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .maybeSingle();

  const payload = {
    id: userId,
    email: normalizedEmail,
    full_name: 'Platform Super Admin',
    role: 'super_admin',
    organization_id: null,
    status: 'active',
    updated_at: new Date().toISOString(),
  };

  const { error } = existingProfile
    ? await supabaseAdmin.from('profiles').update(payload).eq('id', userId)
    : await supabaseAdmin.from('profiles').insert(payload);

  if (error) {
    console.error('[auth] Failed to ensure platform super admin profile', {
      userId,
      email: normalizedEmail,
      error: error.message,
    });
    return { ensured: false, error: error.message };
  }

  console.info('[auth] Platform super admin profile ensured', {
    userId,
    email: normalizedEmail,
  });

  return { ensured: true };
}
