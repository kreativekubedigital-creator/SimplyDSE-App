'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ClipboardCheck,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GuidanceModal } from './GuidanceModal';
import { supabase } from '@/lib/supabase';
import { calculateRisk } from '@/lib/assessment-engine';
import { useRouter } from 'next/navigation';

interface AssessmentWizardProps {
  assessmentId: string;
  template: any;
  organizationId: string;
}

export function AssessmentWizard({ assessmentId, template, organizationId }: AssessmentWizardProps) {
  const router = useRouter();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Guidance State
  const [guidanceState, setGuidanceState] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
    optionId: string;
  } | null>(null);

  const categories = template.categories || [];
  const currentCategory = categories[currentCategoryIndex];
  const questions = currentCategory?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  
  const totalQuestions = categories.reduce((acc: number, cat: any) => acc + (cat.questions?.length || 0), 0);
  const questionsAnswered = Object.keys(answers).length;
  const progress = Math.round((questionsAnswered / totalQuestions) * 100);

  const handleSelectOption = (option: any) => {
    // If option has guidance, trigger the modal
    if (option.guidance_resource_url) {
      setGuidanceState({
        isOpen: true,
        title: `Guidance for ${currentQuestion.text}`,
        url: option.guidance_resource_url,
        optionId: option.id
      });
      return;
    }

    // Otherwise, just save the answer
    saveAnswer(option.id);
  };

  const saveAnswer = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));

    // Move to next question or category
    setTimeout(nextStep, 300);
  };

  const nextStep = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const prevStep = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      setCurrentQuestionIndex(categories[currentCategoryIndex - 1].questions.length - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // 1. Prepare responses for the engine
      const formattedResponses = Object.entries(answers).map(([qId, oId]) => {
        const question = categories.flatMap((c: any) => c.questions).find((q: any) => q.id === qId);
        const option = question.options.find((o: any) => o.id === oId);
        return { question, option };
      });

      // 2. Calculate final risk
      const results = calculateRisk(formattedResponses);

      // 3. Save to Supabase
      // (This is a simplified version, in reality we'd use a transaction or multiple inserts)
      const { error: updateError } = await supabase
        .from('assessments')
        .update({
          status: 'completed',
          score: results.score,
          risk_level: results.riskLevel,
          results_summary: JSON.stringify(results),
          completed_at: new Date().toISOString()
        })
        .eq('id', assessmentId);

      if (updateError) throw updateError;

      // 4. Save individual responses
      const responseInserts = formattedResponses.map(resp => ({
        assessment_id: assessmentId,
        organization_id: organizationId,
        question_id: resp.question.id,
        option_id: resp.option.id,
      }));

      await supabase.from('assessment_responses').insert(responseInserts);

      // 5. Check for escalation
      if (results.requiresHREscalation) {
        await supabase.from('assessment_escalations').insert({
          assessment_id: assessmentId,
          organization_id: organizationId,
          trigger_option_id: formattedResponses.find(r => r.option.hr_flag)?.option.id
        });
      }

      router.push(`/dashboard/assessments/${assessmentId}/report`);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
          <ClipboardCheck className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Assessment Complete</h2>
        <p className="text-slate-500 mt-2 mb-8">All required workplace safety checks have been performed.</p>
        
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[13px] font-bold shadow-xl shadow-slate-900/10 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Generate Compliance Report <ArrowRight className="w-4 h-4" /></>}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">DSE Assessment</p>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">{currentCategory.name}</h1>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[13px] font-bold text-slate-900">{progress}%</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complete</p>
          </div>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-700">
        <div className="p-8 md:p-12 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Question {questionsAnswered + 1} of {totalQuestions}
            </div>
            <h2 className="text-[28px] md:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
              {currentQuestion.text}
            </h2>
            {currentQuestion.description && (
              <div className="flex gap-3 p-4 bg-blue-50/50 border border-blue-100/50 rounded-2xl text-[13px] text-blue-900/80 leading-relaxed">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                {currentQuestion.description}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options?.sort((a:any, b:any) => a.display_order - b.display_order).map((option: any) => {
              const isSelected = answers[currentQuestion.id] === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option)}
                  className={cn(
                    "group w-full text-left p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between",
                    isSelected 
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20 translate-x-2" 
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                  )}
                >
                  <span className="text-[15px] font-bold">{option.text}</span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    isSelected ? "bg-white border-white text-slate-900" : "border-slate-200 group-hover:border-slate-400"
                  )}>
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentCategoryIndex === 0 && currentQuestionIndex === 0}
            className="flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          
          <div className="flex gap-1">
            {categories.map((_: any, i: number) => (
              <div 
                key={i} 
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i === currentCategoryIndex ? "w-6 bg-blue-600" : "bg-slate-300"
                )} 
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            disabled={!answers[currentQuestion.id]}
            className="flex items-center gap-2 text-[13px] font-bold text-blue-600 hover:text-blue-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <GuidanceModal 
        isOpen={!!guidanceState?.isOpen}
        resourceTitle={guidanceState?.title || ''}
        resourceUrl={guidanceState?.url || ''}
        onAcknowledge={() => {
          if (guidanceState) {
            saveAnswer(guidanceState.optionId);
            setGuidanceState(null);
          }
        }}
      />
    </div>
  );
}
