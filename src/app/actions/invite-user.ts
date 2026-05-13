'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function inviteUserAction(email: string, role: string, fullName: string) {
  try {
    // 1. Verify current user is a super_admin
    const supabase = createSupabaseServerClient();
    
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error('Unauthorized');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single();

    if (profile?.role !== 'super_admin') {
      throw new Error('Forbidden: Only Super Admins can invite users');
    }

    // 2. Invite the user via Supabase Auth Admin
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { 
        full_name: fullName,
        role: role 
      }
    });

    if (inviteError) throw inviteError;

    // 3. Create/Update the profile
    if (inviteData?.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: inviteData.user.id,
          email: email,
          full_name: fullName,
          role: role,
          status: 'active'
        });

      if (profileError) throw profileError;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Invite Action Error:', error);
    return { success: false, error: error.message };
  }
}
