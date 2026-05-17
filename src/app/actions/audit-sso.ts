'use server';

import { logSSOEvent, SSOAuditEvent } from '@/lib/audit-logger';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function recordSSOAudit(organizationId: string, action: SSOAuditEvent, details: any = {}, entityId?: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return await logSSOEvent({
    organizationId,
    userId: user?.id,
    action,
    entityId,
    details
  });
}
