'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function deleteOrganizationAction(orgId: string) {
  try {
    // 1. Verify the caller is a super_admin
    const supabase = await createSupabaseServerClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error('Unauthorized');

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single();

    if (callerProfile?.role !== 'super_admin') {
      throw new Error('Forbidden: Only Super Admins can delete organizations');
    }

    // 2. Find all users belonging to this organization
    const { data: orgUsers } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('organization_id', orgId);

    // 3. Delete their auth accounts (so email can be reused)
    if (orgUsers && orgUsers.length > 0) {
      for (const user of orgUsers) {
        // Delete from user_roles first
        await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);

        // Delete profile
        await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', user.id);

        // Delete auth user (frees the email)
        await supabaseAdmin.auth.admin.deleteUser(user.id);
      }
    }

    // 4. Delete the organization itself
    const { error: orgError } = await supabaseAdmin
      .from('organizations')
      .delete()
      .eq('id', orgId);

    if (orgError) throw orgError;

    // 5. Log audit event
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        action: 'ORGANISATION_DELETE',
        entity_type: 'Organisation',
        user_id: authUser.id,
        details: { organization_id: orgId }
      });

    return { success: true };
  } catch (error: any) {
    console.error('Delete Organization Error:', error);
    return { success: false, error: error.message };
  }
}
