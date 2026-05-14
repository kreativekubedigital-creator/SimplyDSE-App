'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

interface CreateAssessmentInput {
  organizationId: string;
  templateId: string;
  userIds: string[]; // employees to assign
  type?: string;
}

export async function createAssessments(input: CreateAssessmentInput) {
  try {
    const { organizationId, templateId, userIds, type } = input;

    if (!organizationId || !templateId || userIds.length === 0) {
      return { success: false, error: 'Missing required fields' };
    }

    // Verify the template exists
    const { data: template, error: tErr } = await supabaseAdmin
      .from('assessment_templates')
      .select('id, name')
      .eq('id', templateId)
      .single();

    if (tErr || !template) {
      return { success: false, error: 'Assessment template not found' };
    }

    // Check for existing pending assessments (avoid duplicates)
    const { data: existing } = await supabaseAdmin
      .from('assessments')
      .select('user_id')
      .eq('organization_id', organizationId)
      .eq('template_id', templateId)
      .in('status', ['pending', 'in_progress'])
      .in('user_id', userIds);

    const existingUserIds = new Set((existing || []).map((a: any) => a.user_id));
    const newUserIds = userIds.filter(id => !existingUserIds.has(id));

    if (newUserIds.length === 0) {
      return { 
        success: false, 
        error: 'All selected employees already have a pending assessment for this template',
        skipped: userIds.length
      };
    }

    // Create assessments for each new user
    const records = newUserIds.map(userId => ({
      organization_id: organizationId,
      user_id: userId,
      template_id: templateId,
      type: type || 'DSE_2024',
      status: 'pending',
    }));

    const { data: created, error: insertErr } = await supabaseAdmin
      .from('assessments')
      .insert(records)
      .select();

    if (insertErr) {
      return { success: false, error: insertErr.message };
    }

    // Create notifications for assigned employees
    const notifications = newUserIds.map(userId => ({
      organization_id: organizationId,
      user_id: userId,
      title: 'New Assessment Assigned',
      message: `You have been assigned a new "${template.name}" assessment. Please complete it at your earliest convenience.`,
      type: 'assessment',
      is_read: false,
    }));

    await supabaseAdmin.from('notifications').insert(notifications);

    return { 
      success: true, 
      created: created?.length || 0,
      skipped: existingUserIds.size,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getAssessmentTemplates(organizationId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('assessment_templates')
      .select('id, name, description, version, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, templates: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getOrgEmployees(organizationId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role, designation')
      .eq('organization_id', organizationId)
      .order('full_name', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, employees: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
