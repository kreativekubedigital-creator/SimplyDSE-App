import { supabase } from './supabase';

let cachedContextPromise: Promise<any> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 2500;
const DEDUPLICATE_WINDOW_MS = 200;

export async function getTenantContext(options?: { forceRefresh?: boolean }) {
  const now = Date.now();
  const shouldForce = options?.forceRefresh && (now - lastFetchTime > DEDUPLICATE_WINDOW_MS);

  if (shouldForce || !cachedContextPromise || (now - lastFetchTime > CACHE_DURATION_MS)) {
    lastFetchTime = now;
    cachedContextPromise = fetchTenantContext();
  }
  return cachedContextPromise;
}

async function fetchTenantContext() {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return { user: null, organizationId: null, organizationName: null, role: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      role, 
      full_name, 
      avatar_url, 
      designation, 
      department,
      organization_id, 
      phone_number,
      preferred_name,
      start_date,
      employment_type,
      employee_id_official,
      work_location,
      manager_id,
      created_at,
      mfa_enabled,
      manager:manager_id(full_name),
      organizations!profiles_organization_id_fkey(name, slug, logo_url)
    `)
    .eq('id', user.id)
    .single();

  let organizationId = profile?.organization_id;
  let organizationName = 'Your Organisation';
  let organizationSlug = 'workspace';
  let organizationLogoUrl = null;

  // Super Admin Logic: Detect tenant from subdomain if user is super_admin OR has no fixed org
  if (profile?.role === 'super_admin' || !organizationId) {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const slug = hostname.split('.')[0];
      
      if (slug && slug !== 'www' && slug !== 'admin' && slug !== 'localhost') {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id, name, slug, logo_url')
          .eq('slug', slug)
          .single();
        
        if (orgData) {
          organizationId = orgData.id;
          organizationName = orgData.name;
          organizationSlug = orgData.slug;
          organizationLogoUrl = orgData.logo_url;
        }
      } else {
        // Fallback for local development or admin subdomain for super_admin
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id, name, slug, logo_url')
          .limit(1)
          .single();
        
        if (orgData) {
          organizationId = orgData.id;
          organizationName = orgData.name;
          organizationSlug = orgData.slug;
          organizationLogoUrl = orgData.logo_url;
        }
      }
    }
  } else {
    const orgs: any = profile?.organizations;
    if (orgs) {
      const org = Array.isArray(orgs) ? orgs[0] : orgs;
      organizationName = org.name;
      organizationSlug = org.slug;
      organizationLogoUrl = org.logo_url;
    }
  }

  return {
    user,
    role: profile?.role,
    fullName: profile?.full_name,
    avatarUrl: profile?.avatar_url,
    designation: profile?.designation,
    department: profile?.department,
    phoneNumber: profile?.phone_number,
    preferredName: profile?.preferred_name,
    startDate: profile?.start_date,
    createdAt: profile?.created_at,
    mfaEnabled: profile?.mfa_enabled,
    employmentType: profile?.employment_type,
    employeeIdOfficial: profile?.employee_id_official,
    workLocation: profile?.work_location,
    managerName: (profile?.manager as any)?.full_name || null,
    organizationId,
    organizationName,
    organizationSlug,
    organizationLogoUrl,
    authMethod: user.app_metadata?.provider || 'email'
  };
}
