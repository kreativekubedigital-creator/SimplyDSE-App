'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export interface ProfileUpdateData {
  fullName?: string;
  phoneNumber?: string;
  preferredName?: string;
  avatarUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  accessibilityPrefs?: any;
  notificationPrefs?: any;
}

export async function updateProfileAction(data: ProfileUpdateData) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const updateData: any = {};
    if (data.fullName !== undefined) updateData.full_name = data.fullName;
    if (data.phoneNumber !== undefined) updateData.phone_number = data.phoneNumber;
    if (data.preferredName !== undefined) updateData.preferred_name = data.preferredName;
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
    if (data.emergencyContactName !== undefined) updateData.emergency_contact_name = data.emergencyContactName;
    if (data.emergencyContactPhone !== undefined) updateData.emergency_contact_phone = data.emergencyContactPhone;
    if (data.accessibilityPrefs !== undefined) updateData.accessibility_prefs = data.accessibilityPrefs;
    if (data.notificationPrefs !== undefined) updateData.notification_prefs = data.notificationPrefs;

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    return { success: false, error: error.message };
  }
}
