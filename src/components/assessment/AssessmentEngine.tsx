'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { 
  Loader2, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Option {
  id: string;
  text: string;
  score: number;
  risk_level: string;
  hr_flag: boolean;
  guidance_resource_url: string | null;
  metadata?: any;
}

interface Question {
  id: string;
  text: string;
  type: string;
  metadata: any;
  is_mandatory: boolean;
  options: Option[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

export function AssessmentEngine() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [textDetails, setTextDetails] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const profile = useProfile();
  const organizationId = profile.organizationId;
  const userId = profile.id;
  const router = useRouter();

  useEffect(() => {
    async function loadAssessment() {
      try {
        // Fetch Template (assuming we just use the first active one for now)
        const { data: template, error: tErr } = await supabase
          .from('assessment_templates')
          .select('id')
          .eq('is_active', true)
          .limit(1)
          .single();

        if (tErr || !template) throw new Error('No active template found');

        // Fetch Categories
        const { data: cats, error: cErr } = await supabase
          .from('assessment_categories')
          .select('*')
          .eq('template_id', template.id)
          .order('display_order', { ascending: true });

        if (cErr) throw cErr;

        // Fetch Questions
        const { data: qs, error: qErr } = await supabase
          .from('assessment_questions')
          .select('*, assessment_options(*)')
          .in('category_id', cats.map(c => c.id))
          .order('display_order', { ascending: true });

        if (qErr) throw qErr;

        // Sort options
        qs.forEach(q => {
          q.options = q.assessment_options.sort((a: any, b: any) => a.display_order - b.display_order);
        });

        // Map questions to categories
        const structuredCats = cats.map(c => ({
          ...c,
          questions: qs.filter(q => q.category_id === c.id)
        }));

        setCategories(structuredCats);
      } catch (err) {
        console.error('Error loading assessment:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAssessment();
  }, []);

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleTextDetail = (questionId: string, value: string) => {
    setTextDetails(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const isStepComplete = () => {
    if (currentStep < 0 || currentStep >= categories.length) return true;
    const cat = categories[currentStep];
    
    // Check conditional visibility for category
    if ((cat as any).metadata?.condition) {
      const cond = (cat as any).metadata.condition;
      // We would need a more complex lookup to find the question ID by text in a real app,
      // but for simplicity, let's assume if it's conditional and we didn't answer the dependency, we skip it.
      // Actually, if a category is skipped, it's complete.
      // We need to implement proper conditional logic here later.
    }

    return cat.questions.every(q => {
      if (!q.is_mandatory) return true;
      const answer = answers[q.id];
      if (q.type === 'single_choice' || q.type === 'boolean') {
        return answer !== undefined;
      }
      return true; // add other type checks
    });
  };

  const submitAssessment = async () => {
    if (!organizationId || !userId) return;
    try {
      setSubmitting(true);
      
      // Calculate scores
      let totalScore = 0;
      let maxRisk = 'low';
      const riskOrder = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };

      const responsesToInsert: any[] = [];
      const reportCategories: any[] = [];
      const strengths: string[] = [];
      const improvements: string[] = [];
      const recommendations: any[] = [];

      categories.forEach(cat => {
        let catScore = 0;
        let catMaxScore = 0;
        let catMaxRisk = 'low';

        cat.questions.forEach(q => {
          // Calculate max possible score for the question
          const maxQScore = Math.max(...q.options.map(o => o.score || 0));
          catMaxScore += maxQScore;

          const ans = answers[q.id];
          if (ans) {
            const selectedOpt = q.options.find(o => o.id === ans);
            if (selectedOpt) {
              const score = selectedOpt.score || 0;
              catScore += score;
              totalScore += score;
              
              const risk = selectedOpt.risk_level || 'low';
              if ((riskOrder as any)[risk] > (riskOrder as any)[maxRisk]) maxRisk = risk;
              if ((riskOrder as any)[risk] > (riskOrder as any)[catMaxRisk]) catMaxRisk = risk;
              
              if (risk === 'low') {
                if (q.type === 'boolean' && selectedOpt.text === 'Yes') {
                  strengths.push(q.text);
                }
              } else {
                improvements.push(`${q.text} (Risk: ${risk})`);
              }

              if (selectedOpt.guidance_resource_url || selectedOpt.hr_flag) {
                recommendations.push({
                  title: `Action needed for: ${q.text}`,
                  description: selectedOpt.hr_flag 
                    ? 'Flagged for HR review. A compliance officer will reach out.' 
                    : `Please review training resource: ${selectedOpt.guidance_resource_url}`
                });
              }

              responsesToInsert.push({
                question_id: q.id,
                option_id: selectedOpt.id,
              });
            }
          }
        });

        reportCategories.push({
          name: cat.name,
          score: catScore,
          maxScore: catMaxScore,
          riskLevel: catMaxRisk
        });
      });

      // Insert Assessment Record
      const { data: assessment, error: aErr } = await supabase
        .from('assessments')
        .insert({
          organization_id: organizationId,
          user_id: userId,
          type: 'dse_workstation',
          status: 'completed',
          score: totalScore,
          risk_level: maxRisk,
          template_id: (categories[0] as any)?.template_id
        })
        .select()
        .single();

      if (aErr) throw aErr;

      // Insert Responses
      const mappedResponses = responsesToInsert.map(r => ({
        ...r,
        assessment_id: assessment.id,
        organization_id: organizationId
      }));

      const { error: rErr } = await supabase
        .from('assessment_responses')
        .insert(mappedResponses);

      if (rErr) throw rErr;

      // Generate PDF Report via API
      try {
        const pdfResponse = await fetch('/api/generate-assessment-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessmentId: assessment.id,
            organizationId,
            userId,
            employeeName: profile.fullName || 'Employee',
            employeeEmail: profile.email || '',
            companyName: profile.organizationName || 'Your Organisation',
            assessmentDate: new Date().toLocaleDateString(),
            overallScore: totalScore,
            overallRiskLevel: maxRisk,
            categories: reportCategories,
            strengths: strengths.slice(0, 5), // Keep top 5 to fit PDF
            improvements: improvements.slice(0, 5),
            recommendations: recommendations.slice(0, 5)
          })
        });
        
        if (!pdfResponse.ok) {
          console.error('Failed to generate PDF', await pdfResponse.text());
        }
      } catch (pdfErr) {
        console.error('Error calling PDF API:', pdfErr);
      }

      router.push('/employee/wellness?tab=assessments&success=true');
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Initializing Assessment Engine...</p>
      </div>
    );
  }

  // Calculate visible categories based on conditional logic
  const visibleCategories = categories.filter(cat => {
    // If it has a metadata condition
    if (cat.name === 'Driving Risk Assessment') {
      // Find the 'Do you use a vehicle for work?' question
      let vehicleQId = '';
      let vehicleYesOptId = '';
      
      categories.forEach(c => {
        c.questions.forEach(q => {
          if (q.text === 'Do you use a vehicle for work?') {
            vehicleQId = q.id;
            const yesOpt = q.options.find(o => o.text === 'Yes');
            if (yesOpt) vehicleYesOptId = yesOpt.id;
          }
        });
      });
      
      return answers[vehicleQId] === vehicleYesOptId;
    }
    return true;
  });

  // Calculate actual step limits based on visible categories
  const isLastCategory = currentStep === categories.length - 1; // Simplification, need to account for hidden ones
  // Better approach: map currentStep index to visibleCategories index
  // For now, let's keep it simple and skip steps if they aren't in visibleCategories
  const handleNextSmart = () => {
    let next = currentStep + 1;
    while (next < categories.length && !visibleCategories.find(c => c.id === categories[next].id)) {
      next++;
    }
    setCurrentStep(next);
    window.scrollTo(0, 0);
  };

  const handleBackSmart = () => {
    let prev = currentStep - 1;
    while (prev >= 0 && !visibleCategories.find(c => c.id === categories[prev].id)) {
      prev--;
    }
    setCurrentStep(prev);
    window.scrollTo(0, 0);
  };

  // --- RENDERING VIEWS --- //

  if (currentStep === -1) {
    return (
      <div className="max-w-3xl mx-auto py-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-12 shadow-sm text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Workstation Assessment</h1>
          <p className="text-slate-500 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            This assessment helps ensure your workstation setup supports your wellbeing, comfort, and safe working practices.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <Clock className="w-6 h-6 text-slate-400 mb-3 mx-auto" />
              <h3 className="font-bold text-slate-900 text-[13px]">10-15 Minutes</h3>
              <p className="text-[11px] text-slate-500 mt-1">Estimated duration</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <AlertCircle className="w-6 h-6 text-slate-400 mb-3 mx-auto" />
              <h3 className="font-bold text-slate-900 text-[13px]">Identify Risks</h3>
              <p className="text-[11px] text-slate-500 mt-1">Get immediate guidance</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-6 h-6 text-slate-400 mb-3 mx-auto" />
              <h3 className="font-bold text-slate-900 text-[13px]">Stay Compliant</h3>
              <p className="text-[11px] text-slate-500 mt-1">Meet HR requirements</p>
            </div>
          </div>

          <button 
            onClick={handleNextSmart}
            className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all active:scale-95"
          >
            Start Assessment <ChevronRight className="w-4 h-4" />
          </button>
          
          <p className="text-[11px] text-slate-400 font-medium mt-6">
            Your responses are confidential and will be securely reviewed by the HR & Compliance team.
          </p>
        </div>
      </div>
    );
  }

  if (currentStep >= categories.length) {
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = visibleCategories.reduce((acc, cat) => acc + cat.questions.length, 0);

    return (
      <div className="max-w-4xl mx-auto py-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-12 shadow-sm">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Assessment Review</h1>
            <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
              Please review your responses before final submission. Your assessment will be securely processed by the HR & Compliance team.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-12">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900">Completion Summary</h3>
              <span className="text-[12px] font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                {answeredCount} / {totalQuestions} Answered
              </span>
            </div>
            <div className="space-y-3">
              {visibleCategories.map((cat, idx) => {
                const catAnswered = cat.questions.filter(q => answers[q.id]).length;
                const isComplete = catAnswered === cat.questions.length;
                return (
                  <div key={cat.id} className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-slate-600">Section {idx + 1}: {cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-slate-400">{catAnswered}/{cat.questions.length}</span>
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleBackSmart}
              className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
            >
              Review Answers
            </button>
            <button 
              onClick={submitAssessment}
              disabled={submitting || answeredCount < totalQuestions}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-600/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </div>
          
          {answeredCount < totalQuestions && (
            <p className="text-center text-rose-500 text-[12px] font-bold mt-4">
              Please complete all mandatory questions before submitting.
            </p>
          )}
        </div>
      </div>
    );
  }

  const currentCategory = categories[currentStep];

  return (
    <div className="max-w-3xl mx-auto py-8 relative">
      {/* Progress */}
      <div className="sticky top-[72px] z-30 bg-[#F8FAFC]/90 backdrop-blur-md pb-6 pt-4 mb-6 border-b border-slate-200/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Section {currentStep + 1} of {categories.length}
          </span>
          <span className="text-[11px] font-bold text-blue-600">
            {Math.round(((currentStep) / categories.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep) / categories.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{currentCategory.name}</h2>
        {currentCategory.description && (
          <p className="text-sm text-slate-500 mt-2">{currentCategory.description}</p>
        )}
      </div>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {currentCategory.questions.map((q, idx) => (
          <div key={q.id} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[12px] font-bold text-slate-400">
                {idx + 1}
              </div>
              <div className="pt-1.5">
                <h3 className="text-[15px] font-bold text-slate-900 leading-snug">{q.text}</h3>
                {q.metadata?.description && (
                  <p className="text-[13px] text-slate-500 mt-1">{q.metadata.description}</p>
                )}
              </div>
            </div>

            <div className="pl-12 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map(opt => {
                const isSelected = answers[q.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(q.id, opt.id)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                      isSelected 
                        ? "border-blue-600 bg-blue-50/50 shadow-sm" 
                        : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <span className={cn(
                      "text-[14px] font-semibold",
                      isSelected ? "text-blue-900" : "text-slate-700"
                    )}>
                      {opt.text}
                    </span>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      isSelected ? "border-blue-600 bg-blue-600" : "border-slate-300"
                    )}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Conditional Textarea */}
            {q.metadata?.requires_details_if && answers[q.id] && q.options.find(o => o.id === answers[q.id])?.text === q.metadata.requires_details_if && (
              <div className="ml-12 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[12px] font-bold text-slate-700 mb-2">Please provide further details</label>
                <textarea
                  value={textDetails[q.id] || ''}
                  onChange={(e) => handleTextDetail(q.id, e.target.value)}
                  className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all resize-none"
                  placeholder="Enter details here..."
                />
              </div>
            )}
            
            {/* Contextual Warning if needed (Mock logic based on answer) */}
            {answers[q.id] && q.options.find(o => o.id === answers[q.id])?.hr_flag && (
              <div className="ml-12 mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-amber-900">Flagged for Review</p>
                  <p className="text-[12px] text-amber-700 mt-0.5">This response will be reviewed by your HR team to provide additional support.</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-200">
        <button 
          onClick={handleBackSmart}
          className="px-6 py-3 text-[13px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
        >
          Previous Section
        </button>
        <button 
          onClick={handleNextSmart}
          disabled={!isStepComplete()}
          className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-[13px] shadow-xl shadow-slate-900/10 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Temporary icon imports
import { Clock } from 'lucide-react';
