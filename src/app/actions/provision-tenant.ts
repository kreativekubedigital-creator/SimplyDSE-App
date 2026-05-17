'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';

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
  console.log('[Provisioning] Starting provisioning for:', data.orgName);
  
  try {
    const slug = data.domain.split('.')[0] || data.orgName.toLowerCase().replace(/\s+/g, '-');
    console.log('[Provisioning] Calculated slug:', slug);

    // 1. Create Organisation
    console.log('[Provisioning] Step 1: Creating Organisation...');
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: data.orgName,
        slug: slug,
        subdomain: slug,
        status: 'active',
        plan: data.plan.toLowerCase(),
        region: data.region,
        industry: data.industry,
        logo_url: data.logoUrl || null
      })
      .select('id')
      .single();

    if (orgError) {
      console.error('[Provisioning] Step 1 Failed:', orgError);
      throw new Error(`Organisation Creation Failed: ${orgError.message}`);
    }
    const OrganisationId = org.id;
    console.log('[Provisioning] Organisation created with ID:', OrganisationId);

    // 2. Fetch the Organisation Admin Role ID
    console.log('[Provisioning] Step 2: Fetching role ID...');
    const { data: role, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('slug', 'organization_admin')
      .single();

    if (roleError) {
      console.error('[Provisioning] Step 2 Failed:', roleError);
      throw new Error(`Role Fetch Failed: ${roleError.message}`);
    }
    console.log('[Provisioning] Role ID fetched:', role.id);

    // 3. Create User via Supabase Auth
    console.log('[Provisioning] Step 3: Handling Admin User...');
    
    // Check for existing user to prevent conflicts
    const { data: userDataCheck, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
       console.warn('[Provisioning] Warning: Could not list users for cleanup check');
    }
    
    const existingUser = userDataCheck?.users?.find(
      (u: any) => u.email?.toLowerCase() === data.adminEmail.toLowerCase()
    );

    if (existingUser) {
      console.log('[Provisioning] Cleaning up existing user:', existingUser.id);
      await supabaseAdmin.from('user_roles').delete().eq('user_id', existingUser.id);
      await supabaseAdmin.from('profiles').delete().eq('id', existingUser.id);
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
    }

    // Create fresh user
    const { data: userData, error: userCreateError } = await supabaseAdmin.auth.admin.createUser({
      email: data.adminEmail,
      password: data.adminPassword || 'SimplyDSE2024!',
      email_confirm: true,
      user_metadata: {
        first_name: data.adminFirstName,
        last_name: data.adminLastName,
        organization_id: OrganisationId
      }
    });

    if (userCreateError) {
      console.error('[Provisioning] Step 3 Failed:', userCreateError);
      throw new Error(`User Creation Failed: ${userCreateError.message}`);
    }
    const userId = userData.user.id;
    console.log('[Provisioning] Admin user created with ID:', userId);

    // 4. Create Profile
    console.log('[Provisioning] Step 4: Creating Profile...');
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

    if (profileError) {
      console.error('[Provisioning] Step 4 Failed:', profileError);
      throw new Error(`Profile Creation Failed: ${profileError.message}`);
    }

    // 5. Assign Role
    console.log('[Provisioning] Step 5: Assigning Role...');
    const { error: userRoleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: role.id,
        organization_id: OrganisationId
      });

    if (userRoleError) {
      console.error('[Provisioning] Step 5 Failed:', userRoleError);
      throw new Error(`Role Assignment Failed: ${userRoleError.message}`);
    }

    // 6. Log Audit Event
    console.log('[Provisioning] Step 6: Logging audit event...');
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

    // 7. Send Welcome Email
    console.log('[Provisioning] Step 7: Sending welcome email...');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const loginLink = `https://${slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'simplydse.online'}/login`;
    const fromEmail = process.env.REPORTS_FROM_EMAIL || 'reports@notifications.simplydse.online';

    try {
      await resend.emails.send({
        from: `SimplyDSE <${fromEmail}>`,
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
      console.log('[Provisioning] Welcome email sent successfully.');
    } catch (emailError) {
      console.error('[Provisioning] Email Delivery Failed (Non-critical):', emailError);
    }

    console.log('[Provisioning] SUCCESS: Workspace online for', data.orgName);
    return { success: true, OrganisationId };
  } catch (error: any) {
    console.error('[Provisioning] CRITICAL ERROR:', error);
    return { success: false, error: error.message || 'An unexpected error occurred during provisioning.' };
  }
}
