'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function inviteUserAction(email: string, role: string, fullName: string, tempPassword?: string) {
  try {
    // 1. Verify current user is a super_admin
    const supabase = await createSupabaseServerClient();
    
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

    let userId: string | undefined;

    if (tempPassword) {
      // Create user directly with a temporary password
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: role,
        }
      });
      if (createError) throw createError;
      userId = createData?.user?.id;
    } else {
      // Invite via email (sends magic link)
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { 
          full_name: fullName,
          role: role 
        }
      });
      if (inviteError) throw inviteError;
      userId = inviteData?.user?.id;
    }

    // 3. Create/Update the profile
    if (userId) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
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

