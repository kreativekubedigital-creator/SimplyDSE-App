'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[]));
}

export async function fetchEmployeeAssignmentsForCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return { success: false, error: 'Unauthorized', assignments: [] };
  }

  const email = user.email.trim().toLowerCase();

  const [{ data: ownProfile }, { data: emailProfiles }, { data: linkedEmployees }, { data: emailEmployees }] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select('id, organization_id, email')
      .eq('id', user.id)
      .maybeSingle(),
    supabaseAdmin
      .from('profiles')
      .select('id, organization_id, email')
      .ilike('email', email),
    supabaseAdmin
      .from('employees')
      .select('id, organization_id, email, auth_user_id')
      .eq('auth_user_id', user.id),
    supabaseAdmin
      .from('employees')
      .select('id, organization_id, email, auth_user_id')
      .ilike('email', email),
  ]);

  const profiles = [ownProfile, ...(emailProfiles || [])].filter(Boolean) as any[];
  const employees = [...(linkedEmployees || []), ...(emailEmployees || [])];
  const employeeIds = unique([user.id, ...profiles.map(p => p.id), ...employees.map(e => e.id)]);
  const organizationIds = unique([...profiles.map(p => p.organization_id), ...employees.map(e => e.organization_id)]);

  if (employeeIds.length === 0) {
    return { success: true, assignments: [] };
  }

  let query = supabaseAdmin
    .from('assessment_assignments')
    .select(`
      *,
      assessment_templates (
        name,
        description,
        version
      )
    `)
    .in('employee_id', employeeIds)
    .order('assigned_at', { ascending: false });

  if (organizationIds.length > 0) {
    query = query.in('organization_id', organizationIds);
  }

  const { data: assignments, error } = await query;

  if (error) {
    console.error('[assignments] Failed to fetch employee assignments', {
      userId: user.id,
      email,
      error: error.message,
    });
    return { success: false, error: error.message, assignments: [] };
  }

  console.info('[assignments] Resolved employee assignments', {
    userId: user.id,
    email,
    employeeIds,
    organizationIds,
    count: assignments?.length || 0,
  });

  return { success: true, assignments: assignments || [], employeeIds, organizationIds };
}
