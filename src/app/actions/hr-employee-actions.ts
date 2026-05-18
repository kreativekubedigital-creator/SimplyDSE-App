'use server';

import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// Standard Supabase Admin Client for operations bypassing standard user restrictions safely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

function normalizeDueDate(value: string | undefined, fallbackDays: number) {
  if (value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime()) && parsed.getFullYear() > 1970) {
      return parsed;
    }
  }

  return new Date(Date.now() + fallbackDays * 24 * 60 * 60 * 1000);
}

/**
 * Verifies that the currently logged-in user is an HR/Admin user
 * and returns their organization context.
 */
async function verifyHRUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, role, organization_id, full_name')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('User profile not found.');
  
  const allowedRoles = ['super_admin', 'organisation_admin', 'organization_admin', 'hr_manager', 'compliance_manager'];
  if (!allowedRoles.includes(profile.role)) {
    throw new Error('You do not have permission to perform this action.');
  }

  return {
    actingUser: profile,
    organizationId: profile.organization_id
  };
}

/**
 * Verifies that the target employee exists and belongs to the same organization.
 */
async function verifyTargetEmployee(employeeId: string, orgId: string | null) {
  const { data: employee } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', employeeId)
    .single();

  if (!employee) throw new Error('Employee record could not be loaded.');
  
  // Enforce tenant isolation
  if (orgId && employee.organization_id !== orgId) {
    throw new Error('Access denied. Employee belongs to another tenant.');
  }

  return employee;
}

/**
 * 1. Update Employee Profile details
 */
export async function hrUpdateEmployee(employeeId: string, data: {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  role: string;
  status: string;
  loginMethod: string;
  employmentType?: string;
  workLocation?: string;
  phone?: string;
}) {
  try {
    const { actingUser, organizationId } = await verifyHRUser();
    const employee = await verifyTargetEmployee(employeeId, organizationId);

    const fullName = `${data.firstName} ${data.lastName}`.trim();
    
    // Update profile in DB
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: fullName,
        email: data.email,
        department: data.department,
        designation: data.jobTitle,
        role: data.role,
        status: data.status,
        employment_type: data.employmentType || 'Full-time',
        work_location: data.workLocation || 'Office',
        phone_number: data.phone || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeId);

    if (updateError) throw updateError;

    // Log Audit event
    await supabaseAdmin.from('audit_logs').insert({
      organization_id: organizationId,
      user_id: actingUser.id,
      action: 'employee_updated',
      entity_type: 'profile',
      entity_id: employeeId,
      details: {
        updated_by: actingUser.full_name,
        changes: data
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('HR Update Employee Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Archive Employee (Soft delete)
 */
export async function hrArchiveEmployee(employeeId: string) {
  try {
    const { actingUser, organizationId } = await verifyHRUser();
    await verifyTargetEmployee(employeeId, organizationId);

    // Set status to archived
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeId);

    if (error) throw error;

    // Log Audit event
    await supabaseAdmin.from('audit_logs').insert({
      organization_id: organizationId,
      user_id: actingUser.id,
      action: 'employee_archived',
      entity_type: 'profile',
      entity_id: employeeId,
      details: {
        archived_by: actingUser.full_name
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('HR Archive Employee Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 3. Suspend Employee
 */
export async function hrSuspendEmployee(employeeId: string) {
  try {
    const { actingUser, organizationId } = await verifyHRUser();
    await verifyTargetEmployee(employeeId, organizationId);

    // Set status to suspended
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        status: 'suspended',
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeId);

    if (error) throw error;

    // Log Audit event
    await supabaseAdmin.from('audit_logs').insert({
      organization_id: organizationId,
      user_id: actingUser.id,
      action: 'employee_suspended',
      entity_type: 'profile',
      entity_id: employeeId,
      details: {
        suspended_by: actingUser.full_name
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('HR Suspend Employee Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 4. Activate Employee
 */
export async function hrActivateEmployee(employeeId: string) {
  try {
    const { actingUser, organizationId } = await verifyHRUser();
    const employee = await verifyTargetEmployee(employeeId, organizationId);

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeId);

    if (error) throw error;

    // Trigger password recovery / invite email
    try {
      if (employee.email) {
        await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: employee.email,
          options: {
            redirectTo: `https://simplydse.online/login`
          }
        });
      }
    } catch (emailErr) {
      console.warn('Failed to send recovery email during reactivation:', emailErr);
    }

    // Log Audit event
    await supabaseAdmin.from('audit_logs').insert({
      organization_id: organizationId,
      user_id: actingUser.id,
      action: 'employee_restored',
      entity_type: 'profile',
      entity_id: employeeId,
      details: {
        activated_by: actingUser.full_name
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('HR Activate Employee Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 5. Assign Assessment
 */
export async function hrAssignAssessment(employeeId: string, templateId: string, dueDateStr: string) {
  try {
    const { actingUser, organizationId } = await verifyHRUser();
    const employee = await verifyTargetEmployee(employeeId, organizationId);

    if (!organizationId) throw new Error('No active organization context found.');

    const dueDate = normalizeDueDate(dueDateStr, 14);

    // Fetch the template & check if it exists
    const { data: template, error: tErr } = await supabaseAdmin
      .from('assessment_templates')
      .select('id, name')
      .eq('id', templateId)
      .single();

    if (tErr || !template) throw new Error('Assessment template not found');

    // Check for existing pending/in-progress assignments to prevent duplicates
    const { data: existing } = await supabaseAdmin
      .from('assessment_assignments')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('assessment_template_id', templateId)
      .eq('employee_id', employeeId)
      .in('status', ['assigned', 'in_progress'])
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'There is already a pending or active assessment of this type assigned to this employee.' };
    }

    // 1. Create a matching record in assessments table (the actual assessment instance)
    const { data: assessment, error: insertErr } = await supabaseAdmin
      .from('assessments')
      .insert({
        organization_id: organizationId,
        user_id: employeeId,
        template_id: templateId,
        type: template.name || 'Hybrid DSE Assessment',
        status: 'pending',
        frequency: 'Annual',
      })
      .select('id')
      .single();

    if (insertErr || !assessment) throw insertErr || new Error('Failed to create assessment instance.');

    // 2. Insert assignment pointing to submission_id
    const { error: assignError } = await supabaseAdmin
      .from('assessment_assignments')
      .insert({
        organization_id: organizationId,
        assessment_template_id: templateId,
        employee_id: employeeId,
        assigned_by: actingUser.id,
        status: 'assigned',
        due_date: dueDate.toISOString(),
        assigned_at: new Date().toISOString(),
        submission_id: assessment.id
      });

    if (assignError) throw assignError;

    // Create Notification
    await supabaseAdmin.from('notifications').insert({
      organization_id: organizationId,
      user_id: employeeId,
      title: 'New Assessment Assigned',
      message: `HR has assigned you a new workstation assessment due on ${dueDate.toLocaleDateString()}.`,
      type: 'assessment',
      is_read: false
    });

    // Log Audit event
    await supabaseAdmin.from('audit_logs').insert({
      organization_id: organizationId,
      user_id: actingUser.id,
      action: 'assessment_assigned',
      entity_type: 'profile',
      entity_id: employeeId,
      details: {
        assigned_by: actingUser.full_name,
        template_id: templateId,
        due_date: dueDate.toISOString()
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('HR Assign Assessment Error:', error);
    return { success: false, error: error.message || 'Assessment assignment failed. Please try again.' };
  }
}

/**
 * 6. Request Reassessment
 */
export async function hrRequestReassessment(employeeId: string, templateId: string, dueDateStr: string, reason: string) {
  try {
    const { actingUser, organizationId } = await verifyHRUser();
    const employee = await verifyTargetEmployee(employeeId, organizationId);

    if (!organizationId) throw new Error('No active organization context found.');

    const dueDate = normalizeDueDate(dueDateStr, 7);

    // Fetch the template & check if it exists
    const { data: template, error: tErr } = await supabaseAdmin
      .from('assessment_templates')
      .select('id, name')
      .eq('id', templateId)
      .single();

    if (tErr || !template) throw new Error('Assessment template not found');

    // Check for existing pending/in-progress assignments to prevent duplicates
    const { data: existing } = await supabaseAdmin
      .from('assessment_assignments')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('assessment_template_id', templateId)
      .eq('employee_id', employeeId)
      .in('status', ['assigned', 'in_progress'])
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'There is already a pending or active assessment of this type assigned to this employee.' };
    }

    // 1. Create a matching record in assessments table (the actual assessment instance)
    const { data: assessment, error: insertErr } = await supabaseAdmin
      .from('assessments')
      .insert({
        organization_id: organizationId,
        user_id: employeeId,
        template_id: templateId,
        type: template.name || 'Hybrid DSE Assessment',
        status: 'pending',
        frequency: 'Annual',
      })
      .select('id')
      .single();

    if (insertErr || !assessment) throw insertErr || new Error('Failed to create assessment instance.');

    // 2. Create new assignment pointing to submission_id
    const { error: assignError } = await supabaseAdmin
      .from('assessment_assignments')
      .insert({
        organization_id: organizationId,
        assessment_template_id: templateId,
        employee_id: employeeId,
        assigned_by: actingUser.id,
        status: 'assigned',
        due_date: dueDate.toISOString(),
        assigned_at: new Date().toISOString(),
        submission_id: assessment.id
      });

    if (assignError) throw assignError;

    // Create Notification with reason
    await supabaseAdmin.from('notifications').insert({
      organization_id: organizationId,
      user_id: employeeId,
      title: 'Reassessment Requested',
      message: `HR has requested a reassessment. Reason: ${reason || 'Standard review'}. Due: ${dueDate.toLocaleDateString()}`,
      type: 'assessment',
      is_read: false
    });

    // Log Audit event
    await supabaseAdmin.from('audit_logs').insert({
      organization_id: organizationId,
      user_id: actingUser.id,
      action: 'reassessment_requested',
      entity_type: 'profile',
      entity_id: employeeId,
      details: {
        requested_by: actingUser.full_name,
        reason: reason,
        template_id: templateId,
        due_date: dueDate.toISOString()
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('HR Request Reassessment Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 7. Add HR note to Employee record
 */
export async function hrAddNote(employeeId: string, noteText: string) {
  try {
    const { actingUser, organizationId } = await verifyHRUser();
    const employee = await verifyTargetEmployee(employeeId, organizationId);

    // Get current accessibility prefs which stores our notes list safely in JSONB
    const currentPrefs = employee.accessibility_prefs || {};
    const notes = currentPrefs.hr_notes || [];

    const newNote = {
      id: Math.random().toString(36).substring(7),
      author: actingUser.full_name,
      authorId: actingUser.id,
      content: noteText,
      createdAt: new Date().toISOString()
    };

    const updatedPrefs = {
      ...currentPrefs,
      hr_notes: [newNote, ...notes]
    };

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        accessibility_prefs: updatedPrefs
      })
      .eq('id', employeeId);

    if (updateError) throw updateError;

    // Log Audit event
    await supabaseAdmin.from('audit_logs').insert({
      organization_id: organizationId,
      user_id: actingUser.id,
      action: 'hr_note_added',
      entity_type: 'profile',
      entity_id: employeeId,
      details: {
        added_by: actingUser.full_name,
        note_id: newNote.id
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('HR Add Note Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 8. Transfer Department
 */
export async function hrTransferDepartment(employeeId: string, newDepartment: string) {
  try {
    const { actingUser, organizationId } = await verifyHRUser();
    const employee = await verifyTargetEmployee(employeeId, organizationId);

    const oldDept = employee.department || 'General';

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        department: newDepartment,
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeId);

    if (updateError) throw updateError;

    // Log Audit event
    await supabaseAdmin.from('audit_logs').insert({
      organization_id: organizationId,
      user_id: actingUser.id,
      action: 'department_transferred',
      entity_type: 'profile',
      entity_id: employeeId,
      details: {
        transferred_by: actingUser.full_name,
        old_department: oldDept,
        new_department: newDepartment
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('HR Transfer Department Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 9. Reset Login Access
 */
export async function hrResetLoginAccess(employeeId: string, email: string) {
  try {
    const { actingUser, organizationId } = await verifyHRUser();
    await verifyTargetEmployee(employeeId, organizationId);

    // Call Supabase admin to invite or trigger password reset link
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `https://simplydse.online/login`
      }
    });

    if (error) throw error;

    // Log Audit event
    await supabaseAdmin.from('audit_logs').insert({
      organization_id: organizationId,
      user_id: actingUser.id,
      action: 'login_reset_requested',
      entity_type: 'profile',
      entity_id: employeeId,
      details: {
        reset_by: actingUser.full_name
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('HR Reset Login Access Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 10. Send Reminder Notification
 */
export async function hrSendReminder(employeeId: string, type: 'incomplete_assessment' | 'overdue_assessment' | 'training' | 'reassessment') {
  try {
    const { actingUser, organizationId } = await verifyHRUser();
    await verifyTargetEmployee(employeeId, organizationId);

    if (!organizationId) throw new Error('No active organization context found.');

    let message = '';
    let title = '';

    if (type === 'incomplete_assessment') {
      title = 'Action Required: Complete Your DSE Assessment';
      message = 'Please log in to your dashboard to finish your outstanding DSE workplace safety assessment.';
    } else if (type === 'overdue_assessment') {
      title = 'URGENT: Overdue Workplace Assessment';
      message = 'Your DSE workstation assessment is overdue. Please complete it immediately to remain compliant.';
    } else if (type === 'training') {
      title = 'New Training Training Notification';
      message = 'Please complete your DSE fundamentals and office safety training modules.';
    } else {
      title = 'Reassessment Outstanding';
      message = 'You have a pending reassessment request from HR. Please review and complete it.';
    }

    // Insert Notification
    await supabaseAdmin.from('notifications').insert({
      organization_id: organizationId,
      user_id: employeeId,
      title: title,
      message: message,
      type: 'system',
      is_read: false
    });

    // Log Audit event
    await supabaseAdmin.from('audit_logs').insert({
      organization_id: organizationId,
      user_id: actingUser.id,
      action: 'reminder_sent',
      entity_type: 'profile',
      entity_id: employeeId,
      details: {
        sent_by: actingUser.full_name,
        reminder_type: type
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('HR Send Reminder Error:', error);
    return { success: false, error: error.message };
  }
}
