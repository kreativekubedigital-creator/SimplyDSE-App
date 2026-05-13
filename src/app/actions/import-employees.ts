'use server';

import { createClient } from '@supabase/supabase-js';
import { getTenantContext } from '@/lib/tenant-context';

interface ImportEmployee {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  department?: string;
}

export async function importEmployees(employees: ImportEmployee[]) {
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

    const results = {
      count: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Note: In a real production app, we would use batch operations and handle rate limits.
    // For this implementation, we process them sequentially for reliability.
    for (const emp of employees) {
      try {
        const tempPassword = Math.random().toString(36).slice(-12) + '!1Aa';
        
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: emp.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            first_name: emp.firstName,
            last_name: emp.lastName,
            organization_id: organizationId
          }
        });

        if (authError) {
          results.failed++;
          results.errors.push(`${emp.email}: ${authError.message}`);
          continue;
        }

        const userId = authData.user.id;

        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            full_name: `${emp.firstName} ${emp.lastName}`.trim(),
            role: 'employee',
            organization_id: organizationId,
            status: 'active'
          })
          .eq('id', userId);

        if (profileError) {
          results.failed++;
          results.errors.push(`${emp.email}: Profile update failed`);
          continue;
        }

        results.count++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`${emp.email}: ${err.message}`);
      }
    }

    // Log the bulk import
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        action: 'EMPLOYEE_BULK_IMPORT',
        entity_type: 'Organisation',
        organization_id: organizationId,
        details: {
          total: employees.length,
          success: results.count,
          failed: results.failed
        }
      });

    return { success: true, ...results };
  } catch (error: any) {
    console.error('Import Error:', error);
    return { success: false, error: error.message };
  }
}
