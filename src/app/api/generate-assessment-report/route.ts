import { NextResponse } from 'next/server';
import { pdf } from '@react-pdf/renderer';
import { AssessmentReportPDF } from '@/components/pdf/AssessmentReportPDF';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import React from 'react';

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Read chunks from the readable stream
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffers: any[] = [];
    stream.on('data', (data) => buffers.push(data));
    stream.on('end', () => resolve(Buffer.concat(buffers)));
    stream.on('error', reject);
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Generating report for body:', { ...body, categories: 'truncated' });
    
    let { 
      assessmentId, 
      organizationId,
      userId,
      employeeName, 
      companyName, 
      assessmentDate, 
      overallScore, 
      overallRiskLevel, 
      categories, 
      strengths, 
      improvements, 
      recommendations,
      employeeEmail
    } = body;

    // 0. Fetch organization slug for tenant-specific links
    const { data: org, error: orgErr } = await supabaseAdmin
      .from('organizations')
      .select('slug, name')
      .eq('id', organizationId)
      .single();
    
    const organizationSlug = org?.slug || '';
    if (org?.name && (!companyName || companyName === 'Organisation')) {
      companyName = org.name;
    }

    // 1. Fetch missing details from DB if needed
    if (!employeeName || employeeName === 'Employee' || !employeeEmail) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();

      if (profile) {
        if (!employeeName || employeeName === 'Employee') employeeName = profile.full_name || 'Employee';
        if (!employeeEmail) employeeEmail = profile.email;
      }
    }

    // 2. Generate PDF Buffer
    const pdfInstance = pdf(
      React.createElement(AssessmentReportPDF, {
        data: {
          employeeName: employeeName || 'Employee',
          companyName: companyName || 'Organisation',
          assessmentDate: assessmentDate || new Date().toLocaleDateString('en-GB'),
          assessmentId: assessmentId || 'N/A',
          overallScore: overallScore || 0,
          overallRiskLevel: overallRiskLevel || 'Low',
          categories: categories || [],
          strengths: strengths || [],
          improvements: improvements || [],
          recommendations: recommendations || []
        }
      }) as any
    );

    const pdfStream = await pdfInstance.toBuffer();
    const pdfBuffer = await streamToBuffer(pdfStream);

    // 3. Upload to Supabase Storage (Private)
    const storagePath = `${organizationId}/${userId}/${assessmentId}/report.pdf`;
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('assessment-reports')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading PDF to storage:', uploadError);
      return NextResponse.json({ error: 'Failed to upload PDF report' }, { status: 500 });
    }

    // 4. Get Signed URL for temporary access if needed (optional for email link, we prefer dashboard link)
    // We'll use the dashboard link for the email "View Report" button.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://simplydse.online';
    const baseUrl = organizationSlug 
      ? `https://${organizationSlug}.${appUrl.replace('https://', '')}`
      : appUrl;
    
    // 5. Save to assessment_reports table
    const { data: report, error: reportErr } = await supabaseAdmin
      .from('assessment_reports')
      .upsert({
        organisation_id: organizationId,
        employee_id: userId,
        assessment_submission_id: assessmentId,
        report_title: `${companyName} - Assessment Report`,
        overall_score: overallScore,
        risk_level: overallRiskLevel,
        category_scores: JSON.stringify(categories),
        strengths: strengths || [],
        areas_for_improvement: improvements || [],
        recommendations: recommendations || [],
        storage_path: storagePath,
        email_status: 'sending'
      }, { onConflict: 'assessment_submission_id' })
      .select()
      .single();

    if (reportErr) {
      console.error('Error saving report record:', reportErr);
      return NextResponse.json({ error: 'Failed to save report record' }, { status: 500 });
    }

    const reportId = report.id;
    const viewReportLink = `${baseUrl}/employee/reports/${assessmentId}`;

    // 6. Send Email via Resend
    let emailStatus = 'failed';
    let providerId = null;
    let emailErrorMessage = null;

    if (resend && employeeEmail && process.env.REPORTS_FROM_EMAIL) {
      try {
        const emailResponse = await resend.emails.send({
          from: `SimplyDSE Reports <${process.env.REPORTS_FROM_EMAIL}>`,
          to: [employeeEmail],
          subject: 'Your SimplyDSE Assessment Report is Ready',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Hello ${employeeName},</h2>
              <p>Your <strong>${companyName}</strong> assessment has been completed successfully.</p>
              <p>Your assessment report is now ready. A PDF copy is attached to this email, and you can also view it securely from your SimplyDSE dashboard.</p>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Overall Risk Level:</strong> ${overallRiskLevel}</p>
              </div>
              <p>If your report includes recommendations or follow-up actions, please review them carefully. Your HR or compliance team may contact you if further action is required.</p>
              <div style="margin: 30px 0;">
                <a href="${viewReportLink}" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">View Report</a>
              </div>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
              <p style="color: #64748b; font-size: 14px;">Kind regards,<br />SimplyDSE<br />Workplace Compliance Platform</p>
            </div>
          `,
          attachments: [
            {
              filename: 'SimplyDSE-Assessment-Report.pdf',
              content: pdfBuffer,
            }
          ]
        });

        if (emailResponse.data) {
          emailStatus = 'sent';
          providerId = emailResponse.data.id;
        } else if (emailResponse.error) {
          emailErrorMessage = emailResponse.error.message;
        }
      } catch (emailErr: any) {
        console.error('Error sending email:', emailErr);
        emailErrorMessage = emailErr.message;
      }
    } else {
      console.log('Skipping email: Resend not configured or missing employee email.');
      emailErrorMessage = 'Resend not configured or missing details';
    }

    // 7. Update report status and log email
    await supabaseAdmin
      .from('assessment_reports')
      .update({ 
        email_status: emailStatus,
        emailed_at: emailStatus === 'sent' ? new Date().toISOString() : null
      })
      .eq('id', reportId);

    await supabaseAdmin
      .from('email_logs')
      .insert({
        organisation_id: organizationId,
        employee_id: userId,
        related_report_id: reportId,
        email_type: 'assessment_report',
        recipient_email: employeeEmail,
        subject: 'Your SimplyDSE Assessment Report is Ready',
        status: emailStatus,
        provider_message_id: providerId,
        error_message: emailErrorMessage
      });

    // 8. Create In-App Notification
    await supabaseAdmin
      .from('notifications')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        title: 'Your assessment report is ready',
        message: `Your assessment report is ready to view and download. Risk level: ${overallRiskLevel}`,
        type: 'assessment_report',
        link: `/employee/reports/${assessmentId}`,
        metadata: JSON.stringify({
          report_id: reportId,
          assessment_id: assessmentId,
          risk_level: overallRiskLevel
        })
      });

    // 9. Notify HR if risk is Medium or higher
    if (['Medium', 'High', 'Critical'].includes(overallRiskLevel)) {
      // Find HR users for this organization
      const { data: hrUsers } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('organization_id', organizationId)
        .in('role', ['org_admin', 'organization_admin']);

      if (hrUsers && hrUsers.length > 0) {
        const hrNotifications = hrUsers.map(hr => ({
          organization_id: organizationId,
          user_id: hr.id,
          title: 'Assessment review required',
          message: `${employeeName} completed an assessment with ${overallRiskLevel} risk.`,
          type: 'hr_review_required',
          link: `/dashboard/compliance?tab=tracking&search=${encodeURIComponent(employeeName)}`,
          metadata: JSON.stringify({
            employee_id: userId,
            employee_name: employeeName,
            report_id: reportId,
            risk_level: overallRiskLevel
          })
        }));

        await supabaseAdmin.from('notifications').insert(hrNotifications);
      }
    }

    return NextResponse.json({ 
      success: true, 
      reportId,
      emailStatus 
    });
  } catch (error: any) {
    console.error('Generate PDF Error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
