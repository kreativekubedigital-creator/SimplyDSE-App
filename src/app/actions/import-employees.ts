'use server';

import { createClient } from '@supabase/supabase-js';
import { getTenantContext } from '@/lib/tenant-context';
import { Resend } from 'resend';

interface ImportEmployee {
  organizationId: string;
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
    if (employees.length === 0) return { success: true, count: 0, failed: 0, errors: [] };
    
    const organizationId = employees[0].organizationId;
    if (!organizationId) throw new Error('No active organization context found.');

    let organizationName = 'Your Organisation';
    let organizationSlug = 'workspace';
    
    const { data: orgData } = await supabaseAdmin
      .from('organizations')
      .select('name, slug')
      .eq('id', organizationId)
      .single();
      
    if (orgData) {
      organizationName = orgData.name;
      organizationSlug = orgData.slug;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const resend = resendApiKey ? new Resend(resendApiKey) : null;
    const loginLink = `https://${organizationSlug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'simplydse.online'}/login`;

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
            full_name: `${emp.firstName} ${emp.lastName}`.trim(),
            organization_id: organizationId,
            role: 'employee'
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
            designation: emp.jobTitle,
            department: emp.department,
            status: 'active'
          })
          .eq('id', userId);

        if (profileError) {
          results.failed++;
          results.errors.push(`${emp.email}: Profile update failed`);
          continue;
        }

        // Send Email
        if (resend) {
          try {
            await resend.emails.send({
              from: 'SimplyDSE <onboarding@simplydse.online>',
              to: emp.email,
              subject: `Welcome to SimplyDSE - Your Employee Account is Ready`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px;">
                  <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 24px;">Welcome to the Team!</h1>
                  <p style="color: #64748b; font-size: 16px; line-height: 24px;">
                    Hello ${emp.firstName}, your employee account for <strong>${organizationName}</strong> has been created. 
                    You can now access your workplace compliance dashboard to complete your DSE assessments.
                  </p>
                  
                  <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin: 32px 0;">
                    <p style="margin: 0 0 12px 0;"><strong>Access Link:</strong> <a href="${loginLink}" style="color: #2563eb;">${loginLink}</a></p>
                    <p style="margin: 0 0 12px 0;"><strong>Email:</strong> ${emp.email}</p>
                    <p style="margin: 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
                  </div>

                  <p style="color: #64748b; font-size: 14px; line-height: 20px;">
                    Please log in and complete your initial health and safety assessment as soon as possible.
                  </p>

                  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                  <p style="color: #94a3b8; font-size: 12px;">
                    This is an automated message from SimplyDSE for ${organizationName}.
                  </p>
                </div>
              `
            });
          } catch (emailErr) {
            console.error(`Failed to send email to ${emp.email}:`, emailErr);
          }
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
