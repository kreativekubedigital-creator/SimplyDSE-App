'use server';

import { createClient } from '@supabase/supabase-js';
import { getTenantContext } from '@/lib/tenant-context';
import { Resend } from 'resend';

interface EmployeeData {
  organizationId: string;
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
    const { organizationId } = data;
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
        full_name: `${data.firstName} ${data.lastName}`.trim(),
        organization_id: organizationId,
        role: data.role || 'employee'
      }
    });

    if (authError) throw authError;
    const userId = authData.user.id;

    // 2. Create or Update Profile with enterprise details
    const employeeRole = (data.role || 'employee').toLowerCase().trim();
    const finalRole = employeeRole === 'super_admin' ? 'employee' : employeeRole;

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: data.email,
        full_name: `${data.firstName} ${data.lastName}`.trim(),
        role: finalRole,
        organization_id: organizationId,
        designation: data.jobTitle,
        department: data.department,
        status: 'active',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

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

    // 4. Send Welcome Email
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

    if (resend) {
      try {
        await resend.emails.send({
          from: 'SimplyDSE <onboarding@simplydse.online>',
          to: data.email,
          subject: `Welcome to SimplyDSE - Your Employee Account is Ready`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px;">
              <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 24px;">Welcome to the Team!</h1>
              <p style="color: #64748b; font-size: 16px; line-height: 24px;">
                Hello ${data.firstName}, your employee account for <strong>${organizationName}</strong> has been created. 
                You can now access your workplace compliance dashboard to complete your DSE assessments.
              </p>
              
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin: 32px 0;">
                <p style="margin: 0 0 12px 0;"><strong>Access Link:</strong> <a href="${loginLink}" style="color: #2563eb;">${loginLink}</a></p>
                <p style="margin: 0 0 12px 0;"><strong>Email:</strong> ${data.email}</p>
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
      } catch (emailError) {
        console.error('Failed to send employee welcome email:', emailError);
      }
    }

    return { success: true, userId };
  } catch (error: any) {
    console.error('Add Employee Error:', error);
    return { success: false, error: error.message };
  }
}
