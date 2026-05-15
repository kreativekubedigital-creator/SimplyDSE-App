'use client';

import React, { useState } from 'react';
import { X, Zap, Bell, ShieldAlert, RotateCcw, Clock, Target, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createWorkflowRule } from '@/app/actions/workflow-actions';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onSuccess: () => void;
  preselectedType?: string;
}

const workflowTypes = [
  { id: 'reassessment_reminder', name: 'Annual Re-assessment', icon: RotateCcw, desc: 'Every 12 months after completion' },
  { id: 'overdue_reminder', name: 'Overdue Reminder', icon: Bell, desc: 'Triggered when task becomes overdue' },
  { id: 'high_risk_escalation', name: 'High-Risk Escalation', icon: ShieldAlert, desc: 'OH review for high risk scores' },
  { id: 'training_reminder', name: 'Training Follow-up', icon: Play, desc: 'Reminders for incomplete training' },
];

export function CreateWorkflowModal({ isOpen, onClose, organizationId, onSuccess, preselectedType }: CreateWorkflowModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    trigger_condition: {
      field: '',
      operator: '',
      value: ''
    }
  });

  React.useEffect(() => {
    if (isOpen && preselectedType) {
      const type = workflowTypes.find(t => t.id === preselectedType);
      if (type) {
        setFormData(prev => ({ ...prev, type: type.id, name: type.name }));
        setStep(2);
      }
    } else if (isOpen && !preselectedType) {
      setStep(1);
      setFormData({
        name: '',
        description: '',
        type: '',
        trigger_condition: { field: '', operator: '', value: '' }
      });
    }
  }, [isOpen, preselectedType]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) return;
    setLoading(true);
    const res = await createWorkflowRule(organizationId, {
      ...formData,
      status: 'active',
      is_enabled: true
    });
    setLoading(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Create Workflow</h3>
            <p className="text-[13px] text-slate-500 font-medium">Step {step} of 2: {step === 1 ? 'Select Template' : 'Configure Rules'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workflowTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setFormData({ ...formData, type: type.id, name: type.name });
                    setStep(2);
                  }}
                  className="flex flex-col p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 transition-all mb-4">
                    <type.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[15px] font-bold text-slate-900 leading-none mb-2">{type.name}</p>
                  <p className="text-[12px] text-slate-400 font-medium leading-relaxed">{type.desc}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Workflow Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Annual DSE Check"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this automation do?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-sm font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Trigger Condition</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm font-medium bg-white"
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      trigger_condition: { ...formData.trigger_condition, field: e.target.value } 
                    })}
                  >
                    <option value="">Select Trigger</option>
                    <option value="assessment_score">Assessment Score</option>
                    <option value="days_overdue">Days Overdue</option>
                    <option value="employment_duration">Employment Duration</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Value</label>
                  <input
                    type="text"
                    placeholder="e.g., 70 or 365"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm font-medium"
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      trigger_condition: { ...formData.trigger_condition, value: e.target.value } 
                    })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => step === 1 ? onClose() : setStep(1)}
            className="px-6 py-2.5 text-[13px] font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step === 2 && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Workflow'}
              <Zap className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
