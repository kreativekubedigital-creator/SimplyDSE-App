-- Bootstrap the permanent SimplyDSE platform super admin and harden employee
-- assignment visibility without disabling RLS or weakening tenant isolation.

create or replace function public.ensure_simplydse_platform_super_admin()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if lower(new.email) = 'kreativekubedigital@gmail.com' then
    insert into public.profiles (
      id,
      email,
      full_name,
      role,
      organization_id,
      status,
      updated_at
    )
    values (
      new.id,
      lower(new.email),
      'Platform Super Admin',
      'super_admin',
      null,
      'active',
      now()
    )
    on conflict (id) do update
      set email = excluded.email,
          role = 'super_admin',
          organization_id = null,
          status = 'active',
          updated_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists ensure_simplydse_platform_super_admin on auth.users;

create trigger ensure_simplydse_platform_super_admin
after insert or update of email on auth.users
for each row
execute function public.ensure_simplydse_platform_super_admin();

insert into public.profiles (
  id,
  email,
  full_name,
  role,
  organization_id,
  status,
  updated_at
)
select
  u.id,
  lower(u.email),
  'Platform Super Admin',
  'super_admin',
  null,
  'active',
  now()
from auth.users u
where lower(u.email) = 'kreativekubedigital@gmail.com'
on conflict (id) do update
  set email = excluded.email,
      role = 'super_admin',
      organization_id = null,
      status = 'active',
      updated_at = now();

do $$
begin
  if to_regclass('public.super_admins') is not null then
    execute $sql$
      insert into public.super_admins (user_id, email, created_at)
      select u.id, lower(u.email), now()
      from auth.users u
      where lower(u.email) = 'kreativekubedigital@gmail.com'
      on conflict do nothing
    $sql$;
  end if;
end $$;

alter table public.assessment_assignments enable row level security;
alter table public.assessments enable row level security;

drop policy if exists "Employees can read own assessment assignments" on public.assessment_assignments;
create policy "Employees can read own assessment assignments"
on public.assessment_assignments
for select
to authenticated
using (
  employee_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = assessment_assignments.employee_id
      and lower(p.email) = lower(auth.jwt() ->> 'email')
      and p.organization_id = assessment_assignments.organization_id
  )
);

drop policy if exists "Employees can update own active assessment assignments" on public.assessment_assignments;
create policy "Employees can update own active assessment assignments"
on public.assessment_assignments
for update
to authenticated
using (
  status in ('assigned', 'in_progress')
  and (
    employee_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = assessment_assignments.employee_id
        and lower(p.email) = lower(auth.jwt() ->> 'email')
        and p.organization_id = assessment_assignments.organization_id
    )
  )
)
with check (
  employee_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = assessment_assignments.employee_id
      and lower(p.email) = lower(auth.jwt() ->> 'email')
      and p.organization_id = assessment_assignments.organization_id
  )
);

drop policy if exists "Employees can read own assessments by profile or auth email" on public.assessments;
create policy "Employees can read own assessments by profile or auth email"
on public.assessments
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = assessments.user_id
      and lower(p.email) = lower(auth.jwt() ->> 'email')
      and p.organization_id = assessments.organization_id
  )
);

drop policy if exists "Employees can update own assessments by profile or auth email" on public.assessments;
create policy "Employees can update own assessments by profile or auth email"
on public.assessments
for update
to authenticated
using (
  status in ('pending', 'in_progress')
  and (
    user_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = assessments.user_id
        and lower(p.email) = lower(auth.jwt() ->> 'email')
        and p.organization_id = assessments.organization_id
    )
  )
)
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = assessments.user_id
      and lower(p.email) = lower(auth.jwt() ->> 'email')
      and p.organization_id = assessments.organization_id
  )
);

-- Fix recursive RLS loops by defining auth helper functions as SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND role IN ('organisation_admin', 'organization_admin', 'org_admin', 'hr_manager', 'compliance_manager')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_organization_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT organization_id FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$;

-- Create comprehensive Super Admin RLS bypass policies
DROP POLICY IF EXISTS "Super admins can do everything on assessment_assignments" ON public.assessment_assignments;
CREATE POLICY "Super admins can do everything on assessment_assignments" ON public.assessment_assignments FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can do everything on employees" ON public.employees;
CREATE POLICY "Super admins can do everything on employees" ON public.employees FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can do everything on workflows" ON public.workflows;
CREATE POLICY "Super admins can do everything on workflows" ON public.workflows FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can do everything on notifications" ON public.notifications;
CREATE POLICY "Super admins can do everything on notifications" ON public.notifications FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can do everything on compliance_frameworks" ON public.compliance_frameworks;
CREATE POLICY "Super admins can do everything on compliance_frameworks" ON public.compliance_frameworks FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can do everything on assessment_templates" ON public.assessment_templates;
CREATE POLICY "Super admins can do everything on assessment_templates" ON public.assessment_templates FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can do everything on assessment_categories" ON public.assessment_categories;
CREATE POLICY "Super admins can do everything on assessment_categories" ON public.assessment_categories FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can do everything on assessment_questions" ON public.assessment_questions;
CREATE POLICY "Super admins can do everything on assessment_questions" ON public.assessment_questions FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can do everything on assessment_options" ON public.assessment_options;
CREATE POLICY "Super admins can do everything on assessment_options" ON public.assessment_options FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can do everything on assessment_responses" ON public.assessment_responses;
CREATE POLICY "Super admins can do everything on assessment_responses" ON public.assessment_responses FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());
