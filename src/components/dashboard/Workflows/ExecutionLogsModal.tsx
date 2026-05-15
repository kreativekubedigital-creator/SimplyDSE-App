'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, XCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWorkflowExecutions } from '@/app/actions/workflow-actions';

interface ExecutionLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
}

export function ExecutionLogsModal({ isOpen, onClose, organizationId }: ExecutionLogsModalProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && organizationId) {
      loadLogs();
    }
  }, [isOpen, organizationId]);

  async function loadLogs() {
    setLoading(true);
    const res = await getWorkflowExecutions(organizationId);
    if (res.success) {
      setLogs(res.data || []);
    }
    setLoading(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Execution Logs</h3>
            <p className="text-[13px] text-slate-500 font-medium">History of automated compliance actions</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={loadLogs}
              className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
              title="Refresh"
            >
              <Clock className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm font-medium">Loading execution history...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">No execution logs recorded yet</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10">
                  <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Workflow</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Details</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-4">
                      <p className="text-[13px] font-bold text-slate-900">{log.workflow_rules?.name || 'Deleted Workflow'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">ID: {log.id.substring(0, 8)}</p>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        {log.status === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500" />
                        )}
                        <span className={cn(
                          "text-[12px] font-semibold capitalize",
                          log.status === 'success' ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <p className="text-[12px] text-slate-600 max-w-xs truncate">
                        {log.error_message || 'Action completed successfully.'}
                      </p>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <p className="text-[12px] font-medium text-slate-900">
                        {new Date(log.created_at).toLocaleDateString('en-GB')}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(log.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
