'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AssessmentWizard } from '@/components/assessments/AssessmentWizard';
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TakeAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setAssessmentId(id);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Authentication required');

        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (!profile?.organization_id) throw new Error('Organisation context missing');
        setOrganizationId(profile.organization_id);

        // Fetch the assessment and its template
        const { data: assessment, error: aError } = await supabase
          .from('assessments')
          .select('*, assessment_templates(*)')
          .eq('id', id)
          .single();

        if (aError) throw aError;
        if (assessment.status === 'completed') {
           setError('This assessment has already been completed.');
           return;
        }

        // Fetch full template with categories, questions and options
        const { data: fullTemplate, error: tError } = await supabase
          .from('assessment_templates')
          .select(`
            *,
            categories:assessment_categories(
              *,
              questions:assessment_questions(
                *,
                options:assessment_options(*)
              )
            )
          `)
          .eq('id', assessment.template_id || (assessment.assessment_templates?.id))
          .single();

        if (tError) throw tError;

        // Sort everything correctly
        fullTemplate.categories.sort((a: any, b: any) => a.display_order - b.display_order);
        fullTemplate.categories.forEach((cat: any) => {
          cat.questions.sort((a: any, b: any) => a.display_order - b.display_order);
          cat.questions.forEach((q: any) => {
            q.options.sort((a: any, b: any) => a.display_order - b.display_order);
          });
        });

        setTemplate(fullTemplate);
      } catch (err: any) {
        console.error('Failed to load assessment:', err);
        setError(err.message || 'An unexpected error occurred while loading the assessment.');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initialising Assessment Engine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900">Unable to Start Assessment</h1>
            <p className="text-sm text-slate-500 leading-relaxed">{error}</p>
          </div>
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      {/* Premium Navigation Header */}
      <nav className="p-6 md:px-12 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-none">SimplyDSE</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Intelligent Assessment Engine</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organisation</p>
            <p className="text-xs font-bold text-slate-900">Enterprise Workspace</p>
          </div>
          <button 
            onClick={() => { if(confirm('Are you sure you want to exit? Your progress will not be saved.')) router.push('/dashboard') }}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
          >
            Exit Assessment
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        <AssessmentWizard 
          assessmentId={assessmentId!} 
          template={template} 
          organizationId={organizationId!} 
        />
      </main>

      {/* Trust Footer */}
      <footer className="p-8 border-t border-slate-100 bg-white text-center">
        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" />
          Secured by SimplyDSE Compliance Guard
        </div>
      </footer>
    </div>
  );
}
