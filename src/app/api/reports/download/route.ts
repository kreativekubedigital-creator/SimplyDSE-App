import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { assessmentId, userId, organizationId } = await req.json();

    if (!assessmentId || !userId || !organizationId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Fetch report record to get storage path
    const { data: report, error: reportErr } = await supabaseAdmin
      .from('assessment_reports')
      .select('storage_path, employee_id, organisation_id')
      .eq('assessment_submission_id', assessmentId)
      .single();

    if (reportErr || !report) {
      // Fallback: check if it's in the old assessments metadata
      const { data: assessment } = await supabaseAdmin
        .from('assessments')
        .select('metadata, user_id, organization_id')
        .eq('id', assessmentId)
        .single();
      
      if (!assessment) return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      
      // Basic security check
      if (assessment.user_id !== userId && organizationId !== assessment.organization_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Try to construct storage path if possible, or use the old URL if it was public
      // But we prefer signed URLs now.
      const storagePath = `${assessment.organization_id}/${assessment.user_id}/${assessmentId}/report.pdf`;
      
      const { data, error: signedError } = await supabaseAdmin.storage
        .from('assessment-reports')
        .createSignedUrl(storagePath, 900); // 15 minutes

      if (signedError) {
        console.error('Signed URL error:', signedError);
        return NextResponse.json({ error: 'Failed to generate secure link' }, { status: 500 });
      }

      return NextResponse.json({ signedUrl: data.signedUrl });
    }

    // 2. Security Check: Ensure user belongs to organization or is the employee
    // (In a real app, you'd also verify the session user ID matches userId or has HR role)
    if (report.employee_id !== userId && report.organisation_id !== organizationId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 3. Generate Signed URL
    const { data, error: signedError } = await supabaseAdmin.storage
      .from('assessment-reports')
      .createSignedUrl(report.storage_path, 900); // 15 minutes

    if (signedError) {
      return NextResponse.json({ error: 'Failed to generate secure link' }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl });

  } catch (error: any) {
    console.error('Download API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
