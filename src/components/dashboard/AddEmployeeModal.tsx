'use client';

import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Building2, 
  ClipboardList, 
  ShieldCheck,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { addEmployee } from '@/app/actions/add-employee';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = [
  { id: 1, title: 'Basic Information', icon: User },
  { id: 2, title: 'Organisation Details', icon: Building2 },
  { id: 3, title: 'Assessment Settings', icon: ClipboardList },
  { id: 4, title: 'Access & Review', icon: ShieldCheck },
];

export function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    jobTitle: '',
    department: '',
    team: '',
    manager: '',
    officeLocation: '',
    employmentType: 'Full-time',
    assessmentType: 'DSE Standard',
    assessmentFrequency: 'Annual',
    accessibilityNeeds: 'None',
    role: 'employee'
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await addEmployee(formData);
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      alert('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add New Employee</h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Manual Enterprise Onboarding</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            {STEPS.map((step) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold transition-all",
                  currentStep >= step.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white text-slate-400 border border-slate-200"
                )}>
                  {currentStep > step.id ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                </div>
                <span className={cn(
                  "text-[11px] font-bold uppercase tracking-tight hidden md:block",
                  currentStep >= step.id ? "text-slate-900" : "text-slate-400"
                )}>
                  {step.title}
                </span>
                {step.id < 4 && <div className="w-4 h-[1px] bg-slate-200 ml-2 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {currentStep === 1 && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase pl-1">First Name</label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="e.g. James"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase pl-1">Last Name</label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="e.g. Wilson"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase pl-1">Work Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="j.wilson@organisation.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase pl-1">Employee ID</label>
                    <input 
                      type="text" 
                      value={formData.employeeId}
                      onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="EMP-1002"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase pl-1">Job Title</label>
                    <input 
                      type="text" 
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="Senior Manager"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase pl-1">Department</label>
                    <select 
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none"
                    >
                      <option value="">Select Department</option>
                      <option value="HR">Human Resources</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Sales">Sales</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase pl-1">Office Location</label>
                    <input 
                      type="text" 
                      value={formData.officeLocation}
                      onChange={(e) => setFormData({...formData, officeLocation: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none"
                      placeholder="London HQ"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase pl-1">Manager</label>
                    <input 
                      type="text" 
                      value={formData.manager}
                      onChange={(e) => setFormData({...formData, manager: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none"
                      placeholder="Search Manager..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase pl-1">Employment Type</label>
                    <select 
                      value={formData.employmentType}
                      onChange={(e) => setFormData({...formData, employmentType: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4">
                    <ClipboardList className="w-6 h-6 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-[13px] font-bold text-blue-900">Assessment Automation</p>
                      <p className="text-[11px] text-blue-700/70 mt-1 leading-relaxed">SimplyDSE will automatically schedule and notify the employee based on these settings.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase pl-1">Assessment Type</label>
                      <select 
                        value={formData.assessmentType}
                        onChange={(e) => setFormData({...formData, assessmentType: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none"
                      >
                        <option value="DSE Standard">DSE Standard 2024</option>
                        <option value="Remote Work">Remote Work Safety</option>
                        <option value="Mental Health">Mental Health Wellbeing</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase pl-1">Frequency</label>
                      <select 
                        value={formData.assessmentFrequency}
                        onChange={(e) => setFormData({...formData, assessmentFrequency: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none"
                      >
                        <option value="Annual">Every 12 Months</option>
                        <option value="Bi-Annual">Every 6 Months</option>
                        <option value="One-time">One-time Activation</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
                    <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Review Record</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase rounded">Ready</span>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-x-12 gap-y-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                        <p className="text-[13px] font-bold text-slate-900">{formData.firstName} {formData.lastName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Work Email</p>
                        <p className="text-[13px] font-bold text-slate-900">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department</p>
                        <p className="text-[13px] font-bold text-slate-900">{formData.department || 'Not Specified'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Job Title</p>
                        <p className="text-[13px] font-bold text-slate-900">{formData.jobTitle || 'Not Specified'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase pl-1">Assign Dashboard Role</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none"
                    >
                      <option value="employee">Standard Employee</option>
                      <option value="organization_admin">HR Administrator</option>
                    </select>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button 
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className="flex items-center gap-2 text-slate-500 text-[12px] font-bold disabled:opacity-0 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Step
          </button>
          
          {currentStep < 4 ? (
            <button 
              onClick={nextStep}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white text-[12px] font-bold rounded-xl hover:bg-slate-800 transition-all"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white text-[12px] font-bold rounded-xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Record...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Confirm & Finalise
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
