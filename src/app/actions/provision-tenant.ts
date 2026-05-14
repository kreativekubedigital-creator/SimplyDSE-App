'use server';

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize a Supabase client with the Service Role key
// This bypasses RLS and allows creating users/roles securely
interface ProvisionRequest {
  orgName: string;
  domain: string;
  industry: string;
  region: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword?: string;
  plan: string;
  logoUrl?: string;
}

export async function provisionTenant(data: ProvisionRequest) {
  // Initialize a Supabase client with the Service Role key inside the function
  // to avoid build-time errors when environment variables are missing.
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
    const slug = data.domain.split('.')[0] || data.orgName.toLowerCase().replace(/\s+/g, '-');

    // 1. Create Organisation
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: data.orgName,
        slug: slug,
        subdomain: slug, // from Phase 1
        status: 'active',
        plan: data.plan.toLowerCase(),
        region: data.region,
        industry: data.industry,
        logo_url: data.logoUrl || null
      })
      .select('id')
      .single();

    if (orgError) throw new Error(`Organisation Creation Failed: ${orgError.message}`);
    const OrganisationId = org.id;

    // 2. Fetch the Organisation Admin Role ID
    const { data: role, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('slug', 'organization_admin')
      .single();

    if (roleError) throw new Error(`Role Fetch Failed: ${roleError.message}`);

    // 3. Create User via Supabase Auth with Password
    // This allows the user to log in immediately without waiting for an email
    const { data: userData, error: userCreateError } = await supabaseAdmin.auth.admin.createUser({
      email: data.adminEmail,
      password: data.adminPassword || 'SimplyDSE2024!', // Fallback if none provided
      email_confirm: true,
      user_metadata: {
        first_name: data.adminFirstName,
        last_name: data.adminLastName,
        organization_id: OrganisationId
      }
    });

    if (userCreateError) throw new Error(`User Creation Failed: ${userCreateError.message}`);
    const userId = userData.user.id;

    // 4. Create Profile (if not created by a trigger automatically, though often it is. We will explicitly update or insert to ensure organization_id is set)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: data.adminEmail,
        full_name: `${data.adminFirstName} ${data.adminLastName}`.trim(),
        organization_id: OrganisationId,
        role: 'organization_admin',
        status: 'active'
      });

    if (profileError) throw new Error(`Profile Creation Failed: ${profileError.message}`);

    // 5. Assign Role in user_roles
    const { error: userRoleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: role.id,
        organization_id: OrganisationId
      });

    if (userRoleError) throw new Error(`Role Assignment Failed: ${userRoleError.message}`);

    // 6. Log Audit Event
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        action: 'Organisation_PROVISION',
        entity_type: 'Organisation',
        organization_id: OrganisationId,
        user_id: userId,
        details: { 
          name: data.orgName, 
          admin: data.adminEmail,
          region: data.region,
          plan: data.plan 
        }
      });

    // 7. Send Welcome Email with Credentials
    const resend = new Resend(process.env.RESEND_API_KEY);
    const loginLink = `https://${slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'simplydse.online'}/login`;

    try {
      await resend.emails.send({
        from: 'SimplyDSE <onboarding@simplydse.online>',
        to: data.adminEmail,
        subject: `Welcome to SimplyDSE - Your Workspace is Ready`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px;">
            <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 24px;">Welcome to SimplyDSE!</h1>
            <p style="color: #64748b; font-size: 16px; line-height: 24px;">
              Your organisation workspace for <strong>${data.orgName}</strong> has been successfully provisioned. 
              You can now log in to your dashboard using the credentials below:
            </p>
            
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin: 32px 0;">
              <p style="margin: 0 0 12px 0;"><strong>Dashboard Link:</strong> <a href="${loginLink}" style="color: #2563eb;">${loginLink}</a></p>
              <p style="margin: 0 0 12px 0;"><strong>Email:</strong> ${data.adminEmail}</p>
              <p style="margin: 0;"><strong>Temporary Password:</strong> ${data.adminPassword || 'SimplyDSE2024!'}</p>
            </div>

            <p style="color: #64748b; font-size: 14px; line-height: 20px;">
              For security reasons, we recommend that you change your password once you have logged in for the first time.
            </p>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
            <p style="color: #94a3b8; font-size: 12px;">
              This is an automated message from the SimplyDSE Provisioning System.
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // We don't throw here because the org is already created, just log it.
    }

    return { success: true, OrganisationId };
  } catch (error: any) {
    console.error('Provisioning Error:', error);
    return { success: false, error: error.message };
  }
}
