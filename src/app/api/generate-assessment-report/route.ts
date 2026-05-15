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
    
    const { 
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

    // 1. Generate PDF Buffer
    const pdfInstance = pdf(
      React.createElement(AssessmentReportPDF, {
        data: {
          employeeName: employeeName || 'Employee',
          companyName: companyName || 'Organisation',
          assessmentDate: assessmentDate || new Date().toLocaleDateString(),
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

    // 2. Upload to Supabase Storage
    const fileName = `${organizationId}/${userId}/${assessmentId}-report.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('assessment-reports')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading PDF to storage:', uploadError);
      return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 });
    }

    // 3. Update Assessment Record with PDF URL
    // Merge with existing metadata to prevent overwriting state
    const { data: currentRec } = await supabaseAdmin
      .from('assessments')
      .select('metadata')
      .eq('id', assessmentId)
      .single();

    const pdfUrl = `${supabaseUrl}/storage/v1/object/public/assessment-reports/${fileName}`;
    
    const { error: updateError } = await supabaseAdmin
      .from('assessments')
      .update({ 
        metadata: { 
          ...(currentRec?.metadata as any || {}),
          pdf_report_url: pdfUrl 
        } 
      })
      .eq('id', assessmentId);

    if (updateError) {
      console.error('Error updating assessment record:', updateError);
      // Don't fail fully here, as PDF is already uploaded.
    }

    // 4. Send Email via Resend
    if (resend && employeeEmail) {
      try {
        await resend.emails.send({
          from: 'SimplyDSE <compliance@simplydse.com>', // Replace with your verified domain
          to: [employeeEmail],
          subject: 'Your DSE Assessment Report',
          text: `Hi ${employeeName},\n\nYour DSE Assessment report is ready. Please find the attached PDF document for your records and compliance needs.\n\nThank you,\nSimplyDSE Compliance Team`,
          attachments: [
            {
              filename: 'Assessment-Report.pdf',
              content: pdfBuffer,
            }
          ]
        });
      } catch (emailErr) {
        console.error('Error sending email:', emailErr);
      }
    } else {
      console.log('Skipping email: Resend not configured or missing employee email.');
    }

    return NextResponse.json({ success: true, pdfUrl });
  } catch (error: any) {
    console.error('Generate PDF Error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
