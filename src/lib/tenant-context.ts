import { supabase } from './supabase';

export async function getTenantContext() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, organizationId: null, organizationName: null, role: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, organization_id, organizations(name, slug)')
    .eq('id', user.id)
    .single();

  let organizationId = profile?.organization_id;
  let organizationName = 'Your Organisation';
  let organizationSlug = 'workspace';

  // Super Admin Logic: Detect tenant from subdomain if user is super_admin OR has no fixed org
  if (profile?.role === 'super_admin' || !organizationId) {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const slug = hostname.split('.')[0];
      
      if (slug && slug !== 'www' && slug !== 'admin' && slug !== 'localhost') {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id, name, slug')
          .eq('slug', slug)
          .single();
        
        if (orgData) {
          organizationId = orgData.id;
          organizationName = orgData.name;
          organizationSlug = orgData.slug;
        }
      }
    }
  } else {
    const orgs: any = profile?.organizations;
    if (orgs) {
      const org = Array.isArray(orgs) ? orgs[0] : orgs;
      organizationName = org.name;
      organizationSlug = org.slug;
    }
  }

  return {
    user,
    role: profile?.role,
    organizationId,
    organizationName,
    organizationSlug
  };
}
