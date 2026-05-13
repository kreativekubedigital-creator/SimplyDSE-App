'use server';

import { createClient } from '@supabase/supabase-js';
import { getTenantContext } from '@/lib/tenant-context';

interface EmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeId?: string;
  jobTitle?: string;
  department?: string;
  team?: string;
  manager?: string;
  officeLocation?: string;
  employmentType?: string;
  assessmentType?: string;
  assessmentFrequency?: string;
  accessibilityNeeds?: string;
  role?: string;
  password?: string;
}

export async function addEmployee(data: EmployeeData) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    const { organizationId } = await getTenantContext();
    if (!organizationId) throw new Error('No active organization context found.');

    // 1. Create the Auth User (Pre-verified)
    // Use provided password or generate one
    const tempPassword = data.password || (Math.random().toString(36).slice(-12) + '!1Aa');
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: data.firstName,
        last_name: data.lastName,
        organization_id: organizationId
      }
    });

    if (authError) throw authError;
    const userId = authData.user.id;

    // 2. Update Profile with enterprise details
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: `${data.firstName} ${data.lastName}`.trim(),
        role: data.role || 'employee',
        organization_id: organizationId,
        status: 'active'
        // Note: Additional metadata like department/title could be stored in a metadata JSONB field 
        // if columns don't exist, but for now we follow the profile schema.
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    // 3. Log Audit Event
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        action: 'EMPLOYEE_ADD',
        entity_type: 'Profile',
        entity_id: userId,
        organization_id: organizationId,
        details: {
          email: data.email,
          title: data.jobTitle,
          department: data.department,
          added_by: 'HR_ADMIN'
        }
      });

    return { success: true, userId };
  } catch (error: any) {
    console.error('Add Employee Error:', error);
    return { success: false, error: error.message };
  }
}
