'use server';

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

interface ImportEmployee {
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  department?: string;
  role?: string;
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
    if (employees.length === 0) return { success: true, count: 0, failed: 0, errors: [] };
    
    const organizationId = employees[0].organizationId;
    if (!organizationId) throw new Error('No active organization context found.');

    // 1. Fetch verified domains for this organization
    const { data: domains } = await supabaseAdmin
      .from('organization_domains')
      .select('domain, sso_enabled')
      .eq('organization_id', organizationId)
      .eq('verified', true);
    
    const verifiedDomains = domains?.map(d => d.domain.toLowerCase()) || [];

    const results = {
      count: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process employees
    for (const emp of employees) {
      try {
        const email = emp.email.toLowerCase().trim();
        const emailDomain = email.split('@')[1];
        const isSSOEligible = verifiedDomains.includes(emailDomain);
        
        // Determine login method and SSO requirement
        const loginMethod = isSSOEligible ? 'sso' : 'email_password';
        const ssoRequired = isSSOEligible;

        // Check if employee already exists
        const { data: existingEmployee } = await supabaseAdmin
          .from('employees')
          .select('id, auth_user_id, role')
          .eq('organization_id', organizationId)
          .eq('email', email)
          .single();

        if (existingEmployee) {
          // UPDATE existing employee
          const { error: updateError } = await supabaseAdmin
            .from('employees')
            .update({
              first_name: emp.firstName,
              last_name: emp.lastName,
              job_title: emp.jobTitle,
              // role: emp.role || existingEmployee.role, // Preserve role unless explicitly provided (as per rule)
              // Note: role is defaulted to 'employee' in schema, but we can allow HR to set it.
              // For MVP, we stick to the safety rule: default to 'employee' for new, preserve for existing.
              updated_at: new Date().toISOString()
            })
            .eq('id', existingEmployee.id);

          if (updateError) {
            results.failed++;
            results.errors.push(`${email}: Update failed - ${updateError.message}`);
            continue;
          }
          results.updated++;
        } else {
          // INSERT new pre-provisioned employee
          const { error: insertError } = await supabaseAdmin
            .from('employees')
            .insert({
              organization_id: organizationId,
              email: email,
              first_name: emp.firstName,
              last_name: emp.lastName,
              job_title: emp.jobTitle,
              role: emp.role || 'employee', // Safety: default to 'employee'
              status: 'pre_provisioned',
              login_method: loginMethod,
              sso_required: ssoRequired,
              auth_user_id: null // Explicitly null for pre-provisioning
            });

          if (insertError) {
            results.failed++;
            results.errors.push(`${email}: Import failed - ${insertError.message}`);
            continue;
          }
          results.count++;
        }
      } catch (err: any) {
        results.failed++;
        results.errors.push(`${emp.email}: ${err.message}`);
      }
    }

    // Create Audit Log
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        action: 'CSV_IMPORT_COMPLETED',
        entity_type: 'Organisation',
        organization_id: organizationId,
        details: {
          total_rows: employees.length,
          added: results.count,
          updated: results.updated,
          failed: results.failed,
          verified_domains: verifiedDomains
        }
      });

    return { success: true, ...results };
  } catch (error: any) {
    console.error('Import Error:', error);
    return { success: false, error: error.message };
  }
}
