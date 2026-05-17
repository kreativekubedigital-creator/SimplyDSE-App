import { supabaseAdmin } from './supabase-admin';

export type SSOAuditEvent = 
  | 'domain_added' 
  | 'domain_verified' 
  | 'domain_deleted' 
  | 'sso_config_updated' 
  | 'sso_login_success' 
  | 'sso_login_failed' 
  | 'employee_linked';

interface AuditLogParams {
  organizationId: string;
  userId?: string | null;
  action: SSOAuditEvent;
  entityId?: string | null;
  details?: any;
}

export async function logSSOEvent({
  organizationId,
  userId = null,
  action,
  entityId = null,
  details = {}
}: AuditLogParams) {
  try {
    const { error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        action: action.startsWith('sso_') ? action : `sso_${action}`,
        entity_type: 'sso_configuration',
        entity_id: entityId,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          module: 'enterprise_sso'
        }
      });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Audit Log Error:', err);
    return { success: false, error: err };
  }
}
