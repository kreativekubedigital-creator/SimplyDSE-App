'use server';

import { createClient } from '@supabase/supabase-js';

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
  plan: string;
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
        industry: data.industry
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

    // 3. Invite User via Supabase Auth
    // This sends an email with a secure link to set their password
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.adminEmail, {
      data: {
        first_name: data.adminFirstName,
        last_name: data.adminLastName,
        organization_id: OrganisationId
      }
    });

    if (inviteError) throw new Error(`User Invite Failed: ${inviteError.message}`);
    const userId = inviteData.user.id;

    // 4. Create Profile (if not created by a trigger automatically, though often it is. We will explicitly update or insert to ensure organization_id is set)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: data.adminEmail,
        full_name: `${data.adminFirstName} ${data.adminLastName}`.trim(),
        organization_id: OrganisationId,
        role: 'organization_admin',
        status: 'invited'
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
        organization_id: OrganisationId, // Important: Tie log to the new org
        user_id: userId, // The system/admin who triggered this is ideal, but here we attach the new user ID
        details: { 
          name: data.orgName, 
          admin: data.adminEmail,
          region: data.region,
          plan: data.plan 
        }
      });

    return { success: true, OrganisationId };
  } catch (error: any) {
    console.error('Provisioning Error:', error);
    return { success: false, error: error.message };
  }
}
