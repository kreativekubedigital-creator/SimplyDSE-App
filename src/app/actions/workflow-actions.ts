'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

export async function getWorkflowRules(organizationId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('workflow_rules')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('Error fetching workflow rules:', err);
    return { success: false, error: err.message };
  }
}

export async function getWorkflowMetrics(organizationId: string) {
  try {
    // 1. Active Workflows count
    const { count: activeCount, error: activeError } = await supabaseAdmin
      .from('workflow_rules')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_enabled', true)
      .eq('status', 'active');

    if (activeError) throw activeError;

    // 2. Successful executions this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: successCount, error: successError } = await supabaseAdmin
      .from('workflow_executions')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'success')
      .gte('created_at', startOfMonth.toISOString());

    if (successError) throw successError;

    // 3. Pending Actions
    const { count: pendingCount, error: pendingError } = await supabaseAdmin
      .from('workflow_actions')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'pending');

    if (pendingError) throw pendingError;

    // 4. Escalations
    const { count: escalatedCount, error: escalatedError } = await supabaseAdmin
      .from('workflow_escalations')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'open');

    if (escalatedError) throw escalatedError;

    return {
      success: true,
      metrics: {
        active: activeCount || 0,
        successful: successCount || 0,
        pending: pendingCount || 0,
        escalated: escalatedCount || 0
      }
    };
  } catch (err: any) {
    console.error('Error fetching workflow metrics:', err);
    return { success: false, error: err.message };
  }
}

export async function createWorkflowRule(organizationId: string, ruleData: any) {
  try {
    const { data, error } = await supabaseAdmin
      .from('workflow_rules')
      .insert([{
        ...ruleData,
        organization_id: organizationId
      }])
      .select()
      .single();

    if (error) throw error;
    
    revalidatePath('/dashboard/workflows');
    return { success: true, data };
  } catch (err: any) {
    console.error('Error creating workflow rule:', err);
    return { success: false, error: err.message };
  }
}

export async function toggleWorkflowRule(ruleId: string, isEnabled: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from('workflow_rules')
      .update({ 
        is_enabled: isEnabled,
        status: isEnabled ? 'active' : 'paused'
      })
      .eq('id', ruleId);

    if (error) throw error;
    
    revalidatePath('/dashboard/workflows');
    return { success: true };
  } catch (err: any) {
    console.error('Error toggling workflow rule:', err);
    return { success: false, error: err.message };
  }
}

export async function getWorkflowExecutions(organizationId: string, limit = 50) {
  try {
    const { data, error } = await supabaseAdmin
      .from('workflow_executions')
      .select(`
        *,
        workflow_rules(name)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('Error fetching workflow executions:', err);
    return { success: false, error: err.message };
  }
}
