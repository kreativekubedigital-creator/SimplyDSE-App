'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

export async function checkEmailSSO(email: string, currentTenantSlug?: string) {

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const domain = normalizedEmail.split('@')[1];
    
    if (!domain) return { ssoRequired: false };

    // 1. Check if domain is verified for any organization
    const { data: domainData, error: domainError } = await supabaseAdmin
      .from('organization_domains')
      .select('organization_id, sso_required, verified, organizations(slug, name, sso_enabled)')
      .eq('domain', domain)
      .eq('verified', true)
      .single();

    if (domainError || !domainData) {
      return { ssoRequired: false };
    }

    const org = domainData.organizations as any;
    
    // 2. Check if SSO is enabled and required for this org/domain
    const ssoRequired = domainData.sso_required || org?.sso_enabled || false;
    
    // 3. Check if an active SSO provider exists
    const { data: provider } = await supabaseAdmin
      .from('organization_sso_providers')
      .select('id, status')
      .eq('organization_id', domainData.organization_id)
      .eq('status', 'active')
      .single();

    return {
      ssoRequired,
      organizationId: domainData.organization_id,
      organizationSlug: org?.slug,
      organizationName: org?.name,
      hasActiveProvider: !!provider,
      domain: domain
    };
  } catch (error) {
    console.error('Check SSO Error:', error);
    return { ssoRequired: false };
  }
}
