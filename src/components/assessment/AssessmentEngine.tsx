'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { 
  Loader2, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Info,
  Clock,
  Shield,
  Heart,
  Monitor,
  Zap,
  Truck,
  Download,
  Eye,
  Activity,
  ArrowRight,
  Save,
  TriangleAlert,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// --- TYPES --- //

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
  display_order: number;
  questions: Question[];
}

interface AssessmentEngineProps {
  assessmentId?: string;
}

// --- GUIDANCE MODAL COMPONENT --- //

function GuidanceModal({ 
  isOpen, 
  onClose, 
  title, 
  content, 
  riskLevel 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  content: string;
  riskLevel: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-300">
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center mb-6",
          riskLevel === 'critical' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
        )}>
          <TriangleAlert className="w-8 h-8" />
        </div>
        
        <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
        <div className="text-slate-600 text-sm mb-8 leading-relaxed space-y-4">
          {content.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] transition-all active:scale-95 shadow-xl shadow-slate-900/20"
        >
          I have read and understand this guidance
        </button>
      </div>
    </div>
  );
}

// --- MAIN ENGINE --- //

export function AssessmentEngine({ assessmentId: preAssignedId }: AssessmentEngineProps = {}) {
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | undefined>(preAssignedId);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState<'intro' | 'guided' | 'review' | 'completed'>('intro');
  const [currentCatIndex, setCurrentCatIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [textResponses, setTextResponses] = useState<Record<string, string>>({});
  const [conditionalDetails, setConditionalDetails] = useState<Record<string, string>>({});
  const [isDetailSaved, setIsDetailSaved] = useState<Record<string, boolean>>({});
  const [isValidationDismissed, setIsValidationDismissed] = useState(false);
  const [acknowledgements, setAcknowledgements] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guidanceModal, setGuidanceModal] = useState<{ isOpen: boolean; title: string; content: string; riskLevel: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const profile = useProfile();
  const organizationId = profile.organizationId;
  const userId = profile.id;
  const router = useRouter();
  const hasTriggeredRegeneration = React.useRef(false);

  // Update active ID if prop changes
  useEffect(() => {
    if (preAssignedId) setActiveAssessmentId(preAssignedId);
  }, [preAssignedId]);

  // Load Data
  useEffect(() => {
    if (profile.loading) return;
    async function loadAssessment() {
      try {
        setLoading(true);
        setError(null);

        // Fetch the "Hybrid DSE Assessment" Template
        const { data: template, error: tErr } = await supabase
          .from('assessment_templates')
          .select('*')
          .eq('name', 'Hybrid DSE Assessment')
          .eq('is_active', true)
          .single();

        if (tErr || !template) throw new Error('Hybrid DSE Assessment template not found');

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

        // Map questions to categories
        const structuredCats = cats.map(c => ({
          ...c,
          questions: qs.filter(q => q.category_id === c.id).map(q => ({
            ...q,
            options: q.assessment_options.sort((a: any, b: any) => a.display_order - b.display_order)
          }))
        }));

        setCategories(structuredCats);

        // Handle Assessment ID (Load existing or Prepare to create)
        let currentId = activeAssessmentId;

        if (!currentId && profile.id && profile.organizationId) {
          // Check for an existing in-progress assessment to resume
          const { data: existing } = await supabase
            .from('assessments')
            .select('id')
            .eq('user_id', profile.id)
            .eq('template_id', template.id)
            .eq('status', 'in_progress')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (existing) {
            currentId = existing.id;
            setActiveAssessmentId(currentId);
          }
        }

        // If we have an ID (either passed or found), load answers
        if (currentId) {
          const { data: resp, error: rErr } = await supabase
            .from('assessment_responses')
            .select('*')
            .eq('assessment_id', currentId);
          
          if (!rErr && resp) {
            const ansMap: Record<string, string> = {};
            const textMap: Record<string, string> = {};
            const condMap: Record<string, string> = {};
            const savedMap: Record<string, boolean> = {};
            
            resp.forEach(r => {
              if (r.option_id) ansMap[r.question_id] = r.option_id;
              if (r.text_response) textMap[r.question_id] = r.text_response;
              if (r.conditional_detail) {
                condMap[r.question_id] = r.conditional_detail;
                savedMap[r.question_id] = true;
              }
            });
            
            setAnswers(ansMap);
            setTextResponses(textMap);
            setConditionalDetails(condMap);
            setIsDetailSaved(savedMap);
            
            // Load saved state and check status
            const { data: currentAssessment } = await supabase
              .from('assessments')
              .select('metadata, status')
              .eq('id', currentId)
              .single();

            if (currentAssessment?.status === 'completed') {
              const searchParams = new URLSearchParams(window.location.search);
              const action = searchParams.get('action');
              if (action !== 'regenerate') {
                setViewState('completed');
                setLoading(false);
                return;
              }
            }

            if (currentAssessment?.metadata) {
              const meta = currentAssessment.metadata as any;
              if (meta.current_category_index !== undefined) {
                setCurrentCatIndex(meta.current_category_index);
              }
              if (meta.current_view_state !== undefined) {
                setViewState(meta.current_view_state);
              }
            }

            // If it's a resume from the list, we might want to jump in, 
            // but if it's the general "Start New", let them see the intro first.
            if (preAssignedId) setViewState('guided');
          }
        }
      } catch (err: any) {
        console.error('Error loading assessment:', err);
        setError(err.message || 'Failed to load assessment structure');
      } finally {
        setLoading(false);
      }
    }

    loadAssessment();
  }, [profile.loading, preAssignedId]);

  // --- LOGIC --- //

  const getVisibleCategories = useCallback(() => {
    return categories.filter(cat => {
      // Conditional Logic: Driving Sections (17-20)
      if (cat.display_order >= 17 && cat.display_order <= 20) {
        // Question 6: "Do you use a car, van, or any other vehicle..."
        const q6 = categories[0]?.questions.find(q => q.text.includes('use a car, van, or any other vehicle'));
        if (q6) {
          const selectedOptId = answers[q6.id];
          const selectedOpt = q6.options.find(o => o.id === selectedOptId);
          return selectedOpt?.text === 'Yes';
        }
      }
      return true;
    });
  }, [categories, answers]);

  const visibleCategories = getVisibleCategories();
  const currentCategory = visibleCategories[currentCatIndex];

  const handleAnswer = (questionId: string, optionId: string) => {
    const question = categories.flatMap(c => c.questions).find(q => q.id === questionId);
    const option = question?.options.find(o => o.id === optionId);
    
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));

    // If "No" is selected for a conditional question, clear details
    if (option?.text.toLowerCase() === 'no') {
      setConditionalDetails(prev => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
      setIsDetailSaved(prev => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }

    // Trigger Guidance Modal for High/Critical Risk
    if (option?.risk_level === 'high' || option?.risk_level === 'critical') {
      setGuidanceModal({
        isOpen: true,
        title: 'Important Guidance',
        content: `You have indicated a potential risk regarding: "${question?.text}".\n\nIt is important to follow health and safety best practices to prevent long-term health issues. Please ensure you adjust your setup as soon as possible and consult your manager if the issue persists.`,
        riskLevel: option.risk_level
      });
      setAcknowledgements(prev => ({ ...prev, [questionId]: new Date().toISOString() }));
    }

    // Autosave
    saveProgress(questionId, optionId, textResponses[questionId], conditionalDetails[questionId]);
  };

  const handleConditionalDetailChange = (questionId: string, text: string) => {
    setConditionalDetails(prev => ({ ...prev, [questionId]: text }));
    setIsDetailSaved(prev => ({ ...prev, [questionId]: false })); // Reset saved state when editing
  };

  const saveConditionalDetail = (questionId: string) => {
    if (!conditionalDetails[questionId]?.trim()) return;
    setIsDetailSaved(prev => ({ ...prev, [questionId]: true }));
    saveProgress(questionId, answers[questionId], textResponses[questionId], conditionalDetails[questionId]);
  };

  const handleTextResponse = (questionId: string, text: string) => {
    setTextResponses(prev => ({ ...prev, [questionId]: text }));
    // For text-only questions, we don't have an optionId, so we pass undefined
    saveProgress(questionId, undefined, text);
  };

  const saveProgress = async (qId: string, optId?: string, text?: string, detail?: string) => {
    let currentId = activeAssessmentId;

    // Create assessment if it doesn't exist yet
    if (!currentId && profile.id && profile.organizationId) {
      try {
        const { data: template } = await supabase
          .from('assessment_templates')
          .select('id')
          .eq('name', 'Hybrid DSE Assessment')
          .single();

        if (template) {
          const { data: created, error: createErr } = await supabase
            .from('assessments')
            .insert({
              user_id: profile.id,
              organization_id: profile.organizationId,
              template_id: template.id,
              type: 'Hybrid DSE Assessment',
              status: 'in_progress'
            })
            .select()
            .single();

          if (!createErr && created) {
            currentId = created.id;
            setActiveAssessmentId(currentId);
          }
        }
      } catch (err) {
        console.error('Error creating assessment on the fly:', err);
        return;
      }
    }

    if (!currentId || !organizationId) return;

    try {
      // Upsert response
      const { error: upsertErr } = await supabase
        .from('assessment_responses')
        .upsert({
          assessment_id: currentId,
          question_id: qId,
          option_id: optId,
          text_response: text,
          conditional_detail: detail,
          organization_id: organizationId,
          acknowledgement_at: acknowledgements[qId]
        }, {
          onConflict: 'assessment_id,question_id'
        });

      if (upsertErr) throw upsertErr;
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const saveAssessmentState = async (catIndex: number, view: string) => {
    if (!activeAssessmentId) return;
    setIsSaving(true);
    try {
      const { data: current } = await supabase
        .from('assessments')
        .select('metadata')
        .eq('id', activeAssessmentId)
        .single();
      
      const newMetadata = {
        ...(current?.metadata as any || {}),
        current_category_index: catIndex,
        current_view_state: view,
        last_saved_at: new Date().toISOString()
      };

      await supabase
        .from('assessments')
        .update({ metadata: newMetadata })
        .eq('id', activeAssessmentId);
      
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error saving assessment state:', err);
    } finally {
      setTimeout(() => setIsSaving(false), 800);
    }
  };

  const handleNext = () => {
    if (currentCatIndex < visibleCategories.length - 1) {
      const nextIndex = currentCatIndex + 1;
      setCurrentCatIndex(nextIndex);
      saveAssessmentState(nextIndex, 'guided');
      window.scrollTo(0, 0);
    } else {
      setViewState('review');
      saveAssessmentState(currentCatIndex, 'review');
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    setIsValidationDismissed(false);
  }, [currentCatIndex]);

  const handleBack = () => {
    if (currentCatIndex > 0) {
      const prevIndex = currentCatIndex - 1;
      setCurrentCatIndex(prevIndex);
      saveAssessmentState(prevIndex, 'guided');
      window.scrollTo(0, 0);
    } else {
      setViewState('intro');
      saveAssessmentState(0, 'intro');
      window.scrollTo(0, 0);
    }
  };

  const isCategoryComplete = () => {
    if (!currentCategory) return false;
    return currentCategory.questions.every(q => {
      if (!q.is_mandatory) return true;
      
      // Basic Mandatory Check
      const isTextOnly = q.type === 'text_response' || (q.options.length === 1 && q.options[0].text.toLowerCase().includes('text response'));
      const hasAnswer = isTextOnly ? !!textResponses[q.id]?.trim() : !!answers[q.id];
      
      if (!hasAnswer) return false;

      // Conditional Detail Check
      const detailOption = q.options.find(o => o.text.toLowerCase().includes('provide details'));
      const selectedOption = q.options.find(o => o.id === answers[q.id]);
      
      if (detailOption && selectedOption?.text.toLowerCase() === 'yes') {
        const detail = conditionalDetails[q.id];
        return !!detail?.trim() && isDetailSaved[q.id];
      }

      return true;
    });
  };

  const calculateResults = () => {
    let totalScore = 0;
    let maxPossibleScore = 0;
    const categoryResults: any[] = [];
    let overallRisk = 'low';

    visibleCategories.forEach(cat => {
      let catScore = 0;
      let catMax = 0;
      let catRisk = 'low';

      cat.questions.forEach(q => {
        const qMax = Math.max(...q.options.map(o => o.score));
        catMax += qMax;

        const ansId = answers[q.id];
        const opt = q.options.find(o => o.id === ansId);
        if (opt) {
          catScore += opt.score;
          if (opt.risk_level === 'critical') catRisk = 'critical';
          else if (opt.risk_level === 'high' && catRisk !== 'critical') catRisk = 'high';
          else if (opt.risk_level === 'medium' && catRisk === 'low') catRisk = 'medium';
        }
      });

      totalScore += catScore;
      maxPossibleScore += catMax;
      categoryResults.push({ 
        name: cat.name, 
        score: catScore, 
        maxScore: catMax, 
        riskLevel: catRisk 
      });
    });

    // Score Normalize to 100
    const normalizedScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
    
    if (normalizedScore > 70) overallRisk = 'critical';
    else if (normalizedScore > 40) overallRisk = 'high';
    else if (normalizedScore > 20) overallRisk = 'medium';
    else overallRisk = 'low';

    return { normalizedScore, overallRisk, categoryResults };
  };

  const handleSubmit = async () => {
    if (submitting || !activeAssessmentId) return;
    
    setSubmitting(true);
    setError(null);
    const { normalizedScore, overallRisk, categoryResults } = calculateResults();

    try {
      // Update assessment status
      const { error: updateErr } = await supabase
        .from('assessments')
        .update({
          status: 'completed',
          score: normalizedScore,
          risk_level: overallRisk,
          completed_at: new Date().toISOString(),
          results_summary: JSON.stringify({ 
            categories: categoryResults,
            total_questions: categories.reduce((acc, c) => acc + c.questions.length, 0),
            answered_questions: Object.keys(answers).length
          })
        })
        .eq('id', activeAssessmentId);

      if (updateErr) throw updateErr;

      // Call PDF Generation API
      const response = await fetch('/api/generate-assessment-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: activeAssessmentId,
          organizationId,
          userId,
          employeeName: profile.fullName || 'Employee',
          employeeEmail: profile.email,
          companyName: profile.organizationName || 'Organisation',
          assessmentDate: new Date().toLocaleDateString('en-GB'),
          overallScore: normalizedScore,
          overallRiskLevel: overallRisk,
          categories: categoryResults,
          strengths: [],
          improvements: [],
          recommendations: []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      router.push(`/employee/reports/${activeAssessmentId}`);
    } catch (err: any) {
      console.error('Error submitting assessment:', err);
      setError(err.message || 'An unexpected error occurred during submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger regeneration if requested
  /* useEffect disabled to prevent blinking/loops - triggering manually if needed
  useEffect(() => {
    if (!loading && !submitting && viewState !== 'completed' && categories.length > 0 && !hasTriggeredRegeneration.current) {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('action') === 'regenerate' && activeAssessmentId) {
        hasTriggeredRegeneration.current = true;
        handleSubmit();
      }
    }
  }, [loading, submitting, viewState, categories, activeAssessmentId]);
  */

  // --- VIEWS --- //

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="text-slate-500 font-medium animate-pulse">Building Assessment Experience...</p>
    </div>
  );

  if (viewState === 'intro') return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hybrid DSE Assessment</h1>
            <p className="text-blue-600 font-bold text-sm mt-1 uppercase tracking-wider">Health, Safety & Wellbeing Workflow</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none mb-12">
          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-slate-600 leading-relaxed text-sm space-y-4">
            <p className="font-bold text-slate-900 text-lg">Introduction</p>
            <p>The law requires your employer to protect your health, safety, and wellbeing while you are at work. This responsibility includes employees who work at locations other than the main business address.</p>
            <p>While there are no specific rules only for remote work, general health and safety laws still apply when you work away from the office.</p>
            <p>This risk assessment is a formal part of the office and remote working policy. You must review it regularly to stay compliant. You should also complete a new assessment if your work routine changes significantly.</p>
            <p className="font-medium text-slate-900">To begin, we need to gather some details about your current working environment.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Clock, title: '15-20 Mins', desc: 'Step-by-step guidance' },
            { icon: Heart, title: 'Wellbeing First', desc: 'Ergonomic best practices' },
            { icon: CheckCircle2, title: 'Compliant', desc: 'UK Health & Safety standards' }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-200 transition-all group">
              <item.icon className="w-6 h-6 text-slate-400 mb-3 group-hover:text-blue-600 transition-colors" />
              <h3 className="font-bold text-slate-900 text-[14px]">{item.title}</h3>
              <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-400">
            <Info className="w-4 h-4" />
            <span className="text-[11px] font-medium uppercase tracking-wider">British English standards applied</span>
          </div>
          <button 
            onClick={() => setViewState('guided')}
            className="w-full sm:w-auto inline-flex items-center gap-2 px-12 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all active:scale-95"
          >
            Enter Guided Workflow <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
      <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-sm">
        <AlertCircle className="w-10 h-10" />
      </div>
      <div className="max-w-md">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-500 text-sm leading-relaxed">{error}</p>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:scale-105 transition-all"
      >
        Try Again
      </button>
    </div>
  );

  if (viewState === 'completed') return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm text-center">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Assessment Submitted</h1>
        <p className="text-slate-500 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
          Your assessment is complete. Click &apos;Finish&apos; to submit your assessment and return to the dashboard.
        </p>

        <div className="bg-slate-50 rounded-[2rem] border border-slate-100 p-8 text-left mb-12">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            What happens next?
          </h3>
          <ul className="space-y-4">
            {[
              'A professional PDF report has been generated and emailed to you.',
              'Your HR team will review your responses and risk score.',
              'Any "High" or "Critical" flags will trigger a follow-up action from a compliance officer.',
              'You can download your report anytime from your dashboard.'
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                  {i + 1}
                </div>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => router.push(`/employee/reports/${activeAssessmentId}`)}
            className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all active:scale-95"
          >
            View Assessment Report
          </button>
          <button 
            onClick={() => router.push('/employee/assessments')}
            className="w-full sm:w-auto px-10 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  if (viewState === 'review') return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
            <FileText className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Submission Review</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
            Please check your sections before final submission. Once submitted, your risk profile will be generated.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {visibleCategories.map((cat, idx) => {
            const catAnswered = cat.questions.filter(q => answers[q.id]).length;
            const isComplete = catAnswered === cat.questions.length;
            return (
              <div key={cat.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h4 className="text-[13px] font-bold text-slate-900">Section {idx + 1}: {cat.name}</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">{catAnswered} of {cat.questions.length} answered</p>
                </div>
                {isComplete ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-[13px] font-bold">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-100">
          <button 
            onClick={() => setViewState('guided')}
            className="text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-all flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Go Back to Questions
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-[320px] inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Submission...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm and Submit Assessment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 relative">
      {/* Progress Bar Sticky */}
      <div className="sticky top-[72px] z-[40] bg-[#F8FAFC]/90 backdrop-blur-md pb-6 pt-4 mb-8 border-b border-slate-200/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest">
              Section {currentCatIndex + 1}
            </div>
            <h2 className="text-[14px] font-bold text-slate-900">{currentCategory?.name}</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold text-slate-400">
              {Math.round(((currentCatIndex) / visibleCategories.length) * 100)}% Complete
            </span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(37,99,235,0.4)]"
            style={{ width: `${((currentCatIndex) / visibleCategories.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Section Header & Guidance */}
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">{currentCategory?.name}</h1>
        {currentCategory?.description && (
          <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-blue-600/10 group-hover:text-blue-600/20 transition-all">
              <Info className="w-12 h-12 rotate-12" />
            </div>
            <div className="relative z-10">
              <h4 className="text-[12px] font-bold text-blue-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Info className="w-3.5 h-3.5" /> Guidance & Instructions
              </h4>
              <div className="text-[13px] text-blue-800/80 leading-relaxed space-y-2 font-medium">
                {currentCategory.description.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-6 mb-16">
        {currentCategory?.questions.map((q, qIdx) => (
          <div key={q.id} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm transition-all hover:shadow-md group">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[13px] font-bold text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                {q.metadata?.question_number || (currentCatIndex * 10 + qIdx + 1)}
              </div>
              <div className="pt-1.5">
                <h3 className="text-[16px] font-bold text-slate-900 leading-snug tracking-tight">{q.text}</h3>
              </div>
            </div>

            <div className="md:pl-12 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options
                .filter(opt => !opt.text.toLowerCase().includes('provide details'))
                .map(opt => {
                  const isSelected = answers[q.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswer(q.id, opt.id)}
                      className={cn(
                        "flex items-center justify-between p-3.5 px-5 rounded-xl border-2 transition-all text-left",
                        isSelected 
                          ? "border-blue-600 bg-blue-50/50 shadow-[0_4px_20px_rgb(37,99,235,0.08)]" 
                          : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <span className={cn(
                        "text-[14px] font-bold",
                        isSelected ? "text-blue-900" : "text-slate-600"
                      )}>
                        {opt.text}
                      </span>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                        isSelected ? "border-blue-600 bg-blue-600" : "border-slate-300"
                      )}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* Conditional Detail View */}
            {(() => {
              const detailOption = q.options.find(o => o.text.toLowerCase().includes('provide details'));
              const selectedOption = q.options.find(o => o.id === answers[q.id]);
              const showDetail = detailOption && selectedOption?.text.toLowerCase() === 'yes';

              if (!showDetail) return null;

              return (
                <div className="md:pl-12 mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" /> Please provide details
                      </label>
                      {isDetailSaved[q.id] && (
                        <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Details Saved
                        </span>
                      )}
                    </div>
                    
                    <textarea
                      value={conditionalDetails[q.id] || ''}
                      onChange={(e) => handleConditionalDetailChange(q.id, e.target.value)}
                      placeholder={q.metadata?.placeholder || "Tell us more about your requirements or setup..."}
                      className={cn(
                        "w-full h-24 p-4 bg-white border rounded-xl text-[14px] text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all resize-none font-medium",
                        isDetailSaved[q.id] ? "border-emerald-100 bg-emerald-50/20" : "border-slate-200 focus:border-blue-500"
                      )}
                    />

                    <div className="flex justify-end">
                      <button
                        onClick={() => saveConditionalDetail(q.id)}
                        disabled={!conditionalDetails[q.id]?.trim()}
                        className={cn(
                          "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all",
                          isDetailSaved[q.id]
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 disabled:opacity-50"
                        )}
                      >
                        {isDetailSaved[q.id] ? (
                          <>Update Details</>
                        ) : (
                          <>
                            <Save className="w-4 h-4" /> Save Details
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Text Response Area */}
            {q.type === 'text_response' && (
              <div className="md:pl-12 mt-4">
                <textarea
                  value={textResponses[q.id] || ''}
                  onChange={(e) => handleTextResponse(q.id, e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-xl text-[13px] text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all resize-none font-medium"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="mt-16 mb-12 flex items-center justify-between p-6 bg-slate-900 rounded-[2rem] shadow-xl border border-white/10 mx-auto max-w-2xl relative">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 text-[13px] font-bold text-slate-400 hover:text-white transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Previous Section
        </button>
        
        <div className="hidden sm:flex items-center gap-2">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full transition-all duration-500",
            isSaving ? "bg-blue-400 animate-ping" : "bg-emerald-500"
          )} />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {isSaving ? 'Saving Progress...' : 'Progress Saved'}
          </span>
        </div>

        {!isCategoryComplete() && !isValidationDismissed && (
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl shadow-xl animate-in slide-in-from-bottom-2 duration-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-[12px] font-bold text-amber-900 leading-tight">
                Please answer all required questions and save any requested details before continuing.
              </p>
            </div>
            <button 
              onClick={() => setIsValidationDismissed(true)}
              className="px-4 py-1.5 bg-amber-600 text-white text-[11px] font-black uppercase tracking-widest rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
            >
              OK
            </button>
          </div>
        )}

        <button 
          onClick={handleNext}
          disabled={!isCategoryComplete()}
          className={cn(
            "inline-flex items-center gap-2 px-10 py-3 rounded-xl font-bold text-[13px] transition-all active:scale-95",
            isCategoryComplete() 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:scale-[1.02]" 
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          )}
        >
          {currentCatIndex === visibleCategories.length - 1 ? 'Review & Submit' : 'Continue Workflow'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal Overlay */}
      {guidanceModal && (
        <GuidanceModal 
          isOpen={guidanceModal.isOpen}
          onClose={() => setGuidanceModal(null)}
          title={guidanceModal.title}
          content={guidanceModal.content}
          riskLevel={guidanceModal.riskLevel}
        />
      )}
    </div>
  );
}

