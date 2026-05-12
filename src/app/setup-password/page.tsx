'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function SetupPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // We only allow setting the password if the user has an active session
  // Supabase auth callback usually logs the user in when they click the magic link
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (!session) {
        setError('Invalid or expired invitation link. Please request a new invite.');
      }
    });
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters for enterprise security.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;

      // Update the user's profile status to active
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ status: 'active' }).eq('id', user.id);
      }

      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to secure account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-emerald-400" />
          
          <div className="w-12 h-12 bg-brand-primary/5 text-brand-primary rounded-xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-6 h-6" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Secure Your Account</h1>
          <p className="text-sm text-slate-500 mt-2 mb-8 leading-relaxed">
            Welcome to SimplyDSE. As an enterprise user, you are required to set a secure password to access your Organisation's workspace.
          </p>

          {success ? (
            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center animate-in fade-in zoom-in-95 duration-500">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-emerald-900 font-bold mb-1">Account Secured</h3>
              <p className="text-emerald-700 text-sm">Redirecting to your workspace...</p>
            </div>
          ) : (
            <form onSubmit={handleSetup} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">New Password</label>
                  <div className="relative">
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
                      placeholder="Minimum 12 characters"
                      required
                    />
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Confirm Password</label>
                  <div className="relative">
                    <input 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
                      placeholder="Repeat password"
                      required
                    />
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || !password || !confirmPassword}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-900/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Set Password & Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
        
        <p className="text-center text-[11px] font-medium text-slate-400 mt-6 uppercase tracking-widest">
          Secured by SimplyDSE Enterprise Auth
        </p>
      </div>
    </div>
  );
}
