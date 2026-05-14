'use client';

import React, { useState, useEffect } from 'react';
import { X, ClipboardList, Users, CheckCircle2, AlertCircle, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createAssessments, getAssessmentTemplates, getOrgEmployees } from '@/app/actions/assessment-actions';

interface CreateAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onSuccess: () => void;
}

export function CreateAssessmentModal({ isOpen, onClose, organizationId, onSuccess }: CreateAssessmentModalProps) {
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ created?: number; skipped?: number; error?: string } | null>(null);

  useEffect(() => {
    if (!isOpen || !organizationId) return;
    setStep(1);
    setSelectedTemplate('');
    setSelectedEmployees(new Set());
    setResult(null);
    setSearchTerm('');

    async function load() {
      setLoading(true);
      const [tRes, eRes] = await Promise.all([
        getAssessmentTemplates(organizationId),
        getOrgEmployees(organizationId),
      ]);
      if (tRes.success) setTemplates(tRes.templates || []);
      if (eRes.success) setEmployees(eRes.employees || []);
      setLoading(false);
    }
    load();
  }, [isOpen, organizationId]);

  const toggleEmployee = (id: string) => {
    setSelectedEmployees(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedEmployees.size === filteredEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployees.map(e => e.id)));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await createAssessments({
      organizationId,
      templateId: selectedTemplate,
      userIds: Array.from(selectedEmployees),
    });

    if (res.success) {
      setResult({ created: res.created, skipped: res.skipped });
      setStep(3);
    } else {
      setResult({ error: res.error });
      setStep(3);
    }
    setSubmitting(false);
  };

  const filteredEmployees = employees.filter(e =>
    (e.full_name || e.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTemplateName = templates.find(t => t.id === selectedTemplate)?.name || '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[600px] max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Create Assessment</h2>
              <p className="text-[11px] text-slate-400 font-medium">Step {step} of 3</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress */}
        <div className="px-8 py-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all",
                  s < step ? "bg-emerald-500 text-white" :
                  s === step ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"
                )}>
                  {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                <span className={cn("text-[11px] font-semibold", s === step ? "text-slate-900" : "text-slate-400")}>
                  {s === 1 ? 'Template' : s === 2 ? 'Assign' : 'Confirm'}
                </span>
                {s < 3 && <div className="flex-1 h-px bg-slate-200" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-[13px] text-slate-400 font-medium mt-3">Loading data...</p>
            </div>
          ) : step === 1 ? (
            /* Step 1: Select Template */
            <div className="space-y-4">
              <p className="text-[13px] text-slate-600 font-medium mb-4">Select an assessment template to assign to your employees:</p>
              {templates.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-[13px]">No active assessment templates found.</div>
              ) : (
                templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={cn(
                      "w-full text-left p-5 rounded-2xl border-2 transition-all",
                      selectedTemplate === t.id
                        ? "border-blue-500 bg-blue-50/50 shadow-md shadow-blue-500/10"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-[14px] font-bold text-slate-900">{t.name}</h4>
                        <p className="text-[12px] text-slate-500 font-medium mt-1">{t.description}</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">v{t.version}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : step === 2 ? (
            /* Step 2: Select Employees */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-slate-600 font-medium">
                  Select employees to assign <span className="font-bold text-slate-900">({selectedEmployees.size} selected)</span>
                </p>
                <button onClick={toggleAll} className="text-[11px] font-bold text-blue-600 hover:underline">
                  {selectedEmployees.size === filteredEmployees.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredEmployees.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-[13px]">No employees found in this organization.</div>
                ) : (
                  filteredEmployees.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => toggleEmployee(emp.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left",
                        selectedEmployees.has(emp.id)
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0",
                        selectedEmployees.has(emp.id) ? "bg-blue-600 border-blue-600" : "border-slate-300"
                      )}>
                        {selectedEmployees.has(emp.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600 flex-shrink-0">
                        {(emp.full_name || emp.email || '?').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 truncate">{emp.full_name || emp.email}</p>
                        <p className="text-[11px] text-slate-400 font-medium truncate">{emp.designation || emp.role || 'Employee'}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Step 3: Confirmation */
            <div className="flex flex-col items-center justify-center py-8">
              {result?.error ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Assignment Failed</h3>
                  <p className="text-[13px] text-slate-500 text-center max-w-sm">{result.error}</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Assessments Assigned!</h3>
                  <p className="text-[13px] text-slate-500 text-center max-w-sm">
                    Successfully assigned <span className="font-bold text-slate-900">{result?.created}</span> assessment{(result?.created || 0) !== 1 ? 's' : ''}.
                    {(result?.skipped || 0) > 0 && (
                      <span className="block mt-1 text-amber-600">{result?.skipped} employee(s) already had a pending assessment and were skipped.</span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-3">Employees have been notified via the platform.</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          {step === 1 && (
            <>
              <button onClick={onClose} className="px-5 py-2.5 text-[12px] font-semibold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
              <button
                onClick={() => setStep(2)}
                disabled={!selectedTemplate}
                className={cn(
                  "px-6 py-2.5 text-[12px] font-bold rounded-xl transition-all",
                  selectedTemplate
                    ? "bg-blue-600 text-white hover:scale-[1.02] shadow-lg shadow-blue-600/20"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                Next: Assign Employees →
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="px-5 py-2.5 text-[12px] font-semibold text-slate-500 hover:text-slate-700 transition-colors">← Back</button>
              <button
                onClick={handleSubmit}
                disabled={selectedEmployees.size === 0 || submitting}
                className={cn(
                  "px-6 py-2.5 text-[12px] font-bold rounded-xl transition-all flex items-center gap-2",
                  selectedEmployees.size > 0 && !submitting
                    ? "bg-blue-600 text-white hover:scale-[1.02] shadow-lg shadow-blue-600/20"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Assign {selectedEmployees.size} Assessment{selectedEmployees.size !== 1 ? 's' : ''}
              </button>
            </>
          )}
          {step === 3 && (
            <div className="w-full flex justify-end">
              <button
                onClick={() => { onSuccess(); onClose(); }}
                className="px-6 py-2.5 bg-slate-900 text-white text-[12px] font-bold rounded-xl hover:scale-[1.02] transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
