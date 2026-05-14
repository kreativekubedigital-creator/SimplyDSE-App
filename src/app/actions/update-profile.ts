'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function updateProfileAction(fullName: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    return { success: false, error: error.message };
  }
}
