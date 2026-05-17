import { supabaseAdmin } from './supabase-admin';
import { logSSOEvent } from './audit-logger';

export async function linkSSOEmployee(userId: string, email: string) {

  try {
    // 1. Find the pre-provisioned employee
    const { data: employee, error: empError } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('email', email.toLowerCase())
      .is('auth_user_id', null)
      .single();

    if (empError || !employee) {
      console.log('No pre-provisioned employee found for linking:', email);
      // We don't have an organization ID here yet, so we can't log to a specific org easily
      // unless we lookup the domain owner. For now, we log as a failure.
      return { success: false, reason: 'no_provision' };
    }

    // 2. Update employee record
    const { error: updateError } = await supabaseAdmin
      .from('employees')
      .update({
        auth_user_id: userId,
        sso_linking_completed: true,
        status: 'active'
      })
      .eq('id', employee.id);

    if (updateError) throw updateError;

    // 3. Ensure profile organization matches
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        organization_id: employee.organization_id,
        // We could also sync role here if needed
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    await logSSOEvent({
      organizationId: employee.organization_id,
      userId,
      action: 'employee_linked',
      details: { email, employeeId: employee.id }
    });

    return { success: true, organizationId: employee.organization_id };
  } catch (error) {
    console.error('SSO Linking Error:', error);
    // Note: If we had organizationId, we'd log 'sso_login_failed' here
    return { success: false, error };
  }
}
