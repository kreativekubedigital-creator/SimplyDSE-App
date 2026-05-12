import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Initialize Supabase Client inside the handler to avoid build-time errors
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase environment variables are missing.');
      return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await request.json();
    const { assessmentId, userId, answers } = body;

    if (!assessmentId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Grading Engine Logic
    let calculatedScore = 100;
    let riskLevel = 'low';
    let flaggedRisks = [];

    if (answers?.frequent_driving && answers.frequent_driving === 'yes') {
      calculatedScore -= 10;
      flaggedRisks.push('High frequency driving detected.');
    }
    if (answers?.glare_on_screen && answers.glare_on_screen === 'yes') {
      calculatedScore -= 15;
      flaggedRisks.push('Screen glare issues reported.');
    }

    if (calculatedScore < 50) riskLevel = 'high';
    else if (calculatedScore < 80) riskLevel = 'medium';

    // 2. Update Supabase Database
    const { data: updatedAssessment, error: updateError } = await supabase
      .from('assessments')
      .update({
        status: 'completed',
        score: calculatedScore,
        risk_level: riskLevel,
        completed_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)
      .select('*, profiles(full_name, email)')
      .single();

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    // 3. Generate Report Payload
    const reportPayload = {
      employeeDetails: {
        name: updatedAssessment.profiles?.full_name || 'Unknown',
        date: new Date().toLocaleDateString(),
      },
      overallStatus: {
        score: calculatedScore,
        riskLevel: riskLevel,
      },
      identifiedRisks: flaggedRisks,
      recommendations: flaggedRisks.length > 0 
        ? ['Review workstation setup', 'Take regular driving breaks'] 
        : ['Continue maintaining good posture'],
    };

    return NextResponse.json({
      message: 'Assessment graded and processed successfully.',
      report_data: reportPayload
    }, { status: 200 });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
