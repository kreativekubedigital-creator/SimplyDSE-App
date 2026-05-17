'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FileText,
  Download,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { importEmployees } from '@/app/actions/import-employees';
import { useProfile } from '@/hooks/useProfile';

interface UploadEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadEmployeesModal({ isOpen, onClose, onSuccess }: UploadEmployeesModalProps) {
  const { organizationId } = useProfile();
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'summary'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [importSummary, setImportSummary] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please upload a .csv file');
      return;
    }
    setFile(selectedFile);
    
    const text = await selectedFile.text();
    const rows = text.split('\n').filter(row => row.trim());
    const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
    
    const employees = rows.slice(1).map(row => {
      const values = row.split(',').map(v => v.trim());
      const emp: any = {};
      headers.forEach((header, index) => {
        if (header.includes('first')) emp.firstName = values[index];
        if (header.includes('last')) emp.lastName = values[index];
        if (header.includes('email')) emp.email = values[index];
        if (header.includes('dept') || header.includes('department')) emp.dept = values[index];
      });
      return emp;
    });

    try {
      const { validateCSVEmployees } = await import('@/app/actions/validate-csv');
      const result = await validateCSVEmployees(organizationId as string, employees);
      if (result.success) {
        setPreviewData(result.data || []);
        setStep('preview');
      } else {
        alert('Validation failed: ' + result.error);
      }
    } catch (err) {
      console.error('Error validating CSV:', err);
      alert('Error processing file');
    }
  };

  const startImport = async () => {
    setStep('importing');
    const validEmployees = previewData.filter(e => e.status !== 'error').map(e => ({
      organizationId: organizationId as string,
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email,
      department: e.dept
    }));

    try {
      const result = await importEmployees(validEmployees);
      setImportSummary(result);
      setStep('summary');
      if (result.success) onSuccess();
    } catch (err) {
      alert('Import failed');
      setStep('preview');
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Bulk Employee Import</h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Enterprise Data Migration</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8">
          {step === 'upload' && (
            <div className="space-y-6">
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-[2rem] p-12 text-center transition-all cursor-pointer group",
                  isDragging ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                )}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".csv,.xlsx"
                  onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                />
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-[15px] font-bold text-slate-900 mb-2">Select a CSV or Excel file</h3>
                <p className="text-[13px] text-slate-500 font-medium">Drag and drop your file here, or click to browse</p>
                <div className="mt-8 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Auto-Validation
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Duplicate Detection
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900">Download Template</p>
                    <p className="text-[11px] text-slate-400 font-medium">Use our standardised format for better results</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[11px] font-bold rounded-lg hover:bg-slate-100 transition-all">
                  <Download className="w-3.5 h-3.5" />
                  Template.csv
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                  <span className="text-[14px] font-bold text-slate-900">{file?.name}</span>
                </div>
                <button onClick={() => setStep('upload')} className="text-[11px] font-bold text-blue-600">Change File</button>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Login Method</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {previewData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4">
                          <p className="text-[13px] font-bold text-slate-900">{row.firstName} {row.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{row.dept}</p>
                        </td>
                        <td className="px-6 py-4 text-[12px] text-slate-500 font-medium">{row.email}</td>
                        <td className="px-6 py-4">
                          {row.isSSOEligible ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-tight">
                              Enterprise SSO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-400 rounded-md text-[10px] font-bold uppercase">
                              Email/Password
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {row.status === 'valid' ? (
                            <span className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                            </span>
                          ) : row.status === 'warning' ? (
                            <span className="flex items-center gap-1.5 text-amber-500 text-[11px] font-bold" title={row.error}>
                              <AlertTriangle className="w-3.5 h-3.5" /> External
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-rose-500 text-[11px] font-bold" title={row.error}>
                              <AlertCircle className="w-3.5 h-3.5" /> Error
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                  <strong>1 Invalid Record</strong> detected. We will skip rows with errors and only import valid employee data.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={onClose}
                  className="px-6 py-3 text-[12px] font-bold text-slate-400"
                >
                  Cancel
                </button>
                <button 
                  onClick={startImport}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white text-[12px] font-bold rounded-xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all"
                >
                  Import {previewData.filter(d => d.status === 'valid').length} Records
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="py-20 text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <Loader2 className="w-20 h-20 text-blue-600 animate-spin opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-blue-600 animate-bounce" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Importing Workforce Data</h3>
              <p className="text-[13px] text-slate-500 font-medium">Please wait while we secure your data in Supabase...</p>
            </div>
          )}

          {step === 'summary' && (
            <div className="space-y-8 py-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4 border-4 border-white shadow-xl shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Import Successful</h3>
                <p className="text-[13px] text-slate-500 font-medium mt-1">Your workforce has been successfully updated.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                  <p className="text-[24px] font-black text-slate-900 leading-none">{importSummary?.count || 0}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Added Successfully</p>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                  <p className="text-[24px] font-black text-slate-900 leading-none">{importSummary?.failed || 0}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Failed/Skipped</p>
                </div>
              </div>

              <button 
                onClick={() => {
                  onClose();
                  onSuccess();
                }}
                className="w-full py-4 bg-slate-900 text-white text-[13px] font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
              >
                Return to Workforce Hub
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
