'use client';

import React, { useState } from 'react';
import { X, Mail, User, Shield, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { inviteUserAction } from '../../app/actions/invite-user';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteUserModal({ isOpen, onClose, onSuccess }: InviteUserModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await inviteUserAction(email, role, fullName);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
        setEmail('');
        setFullName('');
        setRole('user');
      }, 2000);
    } else {
      setError(result.error || 'Failed to send invite');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative p-8 bg-slate-50/50 border-b border-slate-100">
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-4">
            <Mail className="w-7 h-7 text-brand-primary" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900">Invite New Identity</h2>
          <p className="text-slate-500 text-sm mt-1">Send an invitation link to onboard a new user or administrator.</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {success ? (
            <div className="py-12 text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Invite Sent!</h3>
              <p className="text-slate-500 mt-2">An invitation email has been dispatched to {email}.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium animate-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all outline-none"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    type="email"
                    placeholder="john@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Role</label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'user', label: 'Employee', icon: User },
                      { id: 'organization_admin', label: 'Org Admin', icon: Shield },
                      { id: 'super_admin', label: 'Super Admin', icon: Shield },
                    ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                        role === r.id 
                          ? "bg-brand-primary/5 border-brand-primary text-brand-primary" 
                          : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                      )}
                    >
                      <r.icon className="w-5 h-5 shrink-0" />
                      <span className="text-[12px] font-bold">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/25 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Invitation
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
