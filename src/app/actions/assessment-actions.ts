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
  assignedBy: string; // HR/Admin ID
  type?: string;
  frequency?: string;
  dueDate?: string;
}

function normalizeDueDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getFullYear() <= 1970) return null;
  return date.toISOString();
}

export async function createAssessments(input: CreateAssessmentInput) {
  try {
    const { organizationId, templateId, userIds, assignedBy, type, frequency, dueDate } = input;
    const normalizedDueDate = normalizeDueDate(dueDate);

    const missingFields = [];
    if (!organizationId) missingFields.push('organizationId');
    if (!templateId) missingFields.push('templateId');
    if (!userIds || userIds.length === 0) missingFields.push('userIds');
    if (!assignedBy) missingFields.push('assignedBy');

    if (missingFields.length > 0) {
      return { success: false, error: `Missing required fields: ${missingFields.join(', ')}` };
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

    // Check for existing pending assignments (avoid duplicates)
    const { data: existing } = await supabaseAdmin
      .from('assessment_assignments')
      .select('employee_id')
      .eq('organization_id', organizationId)
      .eq('assessment_template_id', templateId)
      .in('status', ['assigned', 'in_progress'])
      .in('employee_id', userIds);

    const existingEmployeeIds = new Set((existing || []).map((a: any) => a.employee_id));
    const newEmployeeIds = userIds.filter(id => !existingEmployeeIds.has(id));

    if (newEmployeeIds.length === 0) {
      return { 
        success: true, 
        created: 0,
        skipped: userIds.length
      };
    }

    // 1. Create records in assessments table (the actual assessment instances)
    const assessmentRecords = newEmployeeIds.map(userId => ({
      organization_id: organizationId,
      user_id: userId,
      template_id: templateId,
      type: type || 'DSE_2024',
      status: 'pending',
      frequency: frequency || 'Annual',
    }));

    const { data: createdAssessments, error: insertErr } = await supabaseAdmin
      .from('assessments')
      .insert(assessmentRecords)
      .select();

    if (insertErr) throw insertErr;

    // 2. Create records in assessment_assignments table (the HR tracking records)
    const assignmentRecords = (createdAssessments || []).map(assessment => ({
      organization_id: organizationId,
      assessment_template_id: templateId,
      employee_id: assessment.user_id,
      assigned_by: assignedBy,
      status: 'assigned',
      due_date: normalizedDueDate,
      submission_id: assessment.id
    }));


    const { error: assignErr } = await supabaseAdmin
      .from('assessment_assignments')
      .insert(assignmentRecords);

    if (assignErr) throw assignErr;

    // 3. Create notifications for assigned employees
    const notifications = newEmployeeIds.map(userId => ({
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
      created: createdAssessments?.length || 0,
      skipped: existingEmployeeIds.size,
    };
  } catch (err: any) {
    console.error('Error in createAssessments:', err);
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

export async function sendAssessmentReminders(organizationId: string) {
  try {
    const { data: pending, error } = await supabaseAdmin
      .from('assessments')
      .select(`
        user_id,
        assessment_templates (
          name
        )
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'pending');

    if (error) return { success: false, error: error.message };
    if (!pending || pending.length === 0) return { success: true, sent: 0 };

    const notifications = pending.map((p: any) => ({
      organization_id: organizationId,
      user_id: p.user_id,
      title: 'Assessment Reminder',
      message: `Friendly reminder to complete your "${p.assessment_templates?.name || 'assigned'}" assessment.`,
      type: 'assessment',
      is_read: false,
    }));

    const { error: notifyErr } = await supabaseAdmin.from('notifications').insert(notifications);
    if (notifyErr) return { success: false, error: notifyErr.message };

    return { success: true, sent: notifications.length };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
