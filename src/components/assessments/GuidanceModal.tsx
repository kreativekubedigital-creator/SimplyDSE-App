'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X,
  ExternalLink,
  ShieldCheck,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuidanceModalProps {
  isOpen: boolean;
  resourceTitle: string;
  resourceUrl: string;
  onAcknowledge: () => void;
}

export function GuidanceModal({ isOpen, resourceTitle, resourceUrl, onAcknowledge }: GuidanceModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Mandatory Guidance Required</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Legal Compliance Acknowledgement</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#FDFDFD]">
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 shrink-0" />
            <div className="space-y-1">
              <p className="text-[13px] font-semibold text-blue-900">Important Safety Notice</p>
              <p className="text-[13px] text-blue-800/80 leading-relaxed">
                Based on your previous answer, you are required to review the following health and safety guidance before proceeding with your assessment.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Document to Review</label>
            <div className="group relative bg-white border border-slate-200 rounded-2xl p-6 transition-all hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 tracking-tight">{resourceTitle}</p>
                    <p className="text-xs text-slate-500 font-medium">Official Workplace Safety PDF • 1.2 MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={resourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-all" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Guidance Summary</h3>
            <ul className="space-y-2.5">
              {[
                'Ensure your workstation is adjusted correctly.',
                'Take regular breaks from display screen equipment.',
                'Follow the 20-20-20 rule for eye health.',
                'Report recurring pain to your line manager or HR.'
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-slate-600 leading-tight">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer / Acknowledgement */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer transition-colors hover:bg-slate-100 group">
            <input 
              type="checkbox" 
              checked={isAcknowledged}
              onChange={(e) => setIsAcknowledged(e.target.checked)}
              className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-600/20"
            />
            <span className="text-[13px] font-semibold text-slate-700 group-hover:text-slate-900">
              I have read the mandatory guidance and understand my responsibilities.
            </span>
          </label>

          <button
            onClick={onAcknowledge}
            disabled={!isAcknowledged}
            className="w-full mt-4 py-4 bg-slate-900 text-white rounded-2xl text-[13px] font-bold shadow-xl shadow-slate-900/10 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
          >
            Confirm & Continue Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
