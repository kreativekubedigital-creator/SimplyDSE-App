import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client for the Server
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Needs to bypass RLS for grading/updating

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { assessmentId, userId, answers } = body;

    if (!assessmentId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Grading Engine Logic
    // In a real scenario, we map the 'answers' against the DOCX questions to calculate a score
    let calculatedScore = 100;
    let riskLevel = 'low';
    let flaggedRisks = [];

    // Example logic mapping to the DOCX questions
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
    // This payload matches the key sections outlined from the PDF report
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

    // 4. Dispatch Email (Mock)
    // Here we would use Resend / SendGrid to send the email with the attached/linked report
    console.log(`[EMAIL SYSTEM] Dispatching result to ${updatedAssessment.profiles?.email}...`);
    console.log(`[EMAIL SYSTEM] Payload:`, reportPayload);

    return NextResponse.json({
      message: 'Assessment graded and processed successfully.',
      report_data: reportPayload
    }, { status: 200 });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
