'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Loader2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  tenantSlug: string;
  nextUrl?: string;
  isSuperAdmin: boolean;
}

export default function LoginForm({ tenantSlug, nextUrl, isSuperAdmin }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Ensure the user actually belongs to this Workspace if we are not on www or admin
      if (tenantSlug && tenantSlug !== 'www' && tenantSlug !== 'admin') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id, organizations(subdomain)')
          .eq('id', data.user.id)
          .single();

        // @ts-ignore
        if (profile?.organizations?.subdomain !== tenantSlug) {
          // Force sign out because they logged into the wrong Workspace
          await supabase.auth.signOut();
          throw new Error('This account does not have access to this workspace.');
        }
      }

      // Route based on role/Workspace
      if (isSuperAdmin) {
        router.push('/admin');
      } else {
        router.push(nextUrl || '/dashboard');
      }
      
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSSO = () => {
    // Placeholder for Enterprise SSO
    setError('SAML SSO is currently being configured for your Organisation by your IT administrator.');
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13px] font-medium text-center">
          {error}
        </div>
      )}

      {/* Standard Credentials */}
      <form onSubmit={handleStandardLogin} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Work Email</label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
            placeholder="name@company.com"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between pl-1 pr-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
            <button type="button" className="text-[11px] font-bold text-brand-primary hover:underline">
              Forgot password?
            </button>
          </div>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
            placeholder="••••••••••••"
            required
          />
        </div>

        <button 
          type="submit"
          disabled={isSubmitting || !email || !password}
          className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl text-[13px] font-bold shadow-lg shadow-slate-900/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none mt-2"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-[1px] bg-slate-100" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or</span>
        <div className="flex-1 h-[1px] bg-slate-100" />
      </div>

      {/* Enterprise SSO */}
      <button 
        type="button"
        onClick={handleSSO}
        className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[13px] font-bold hover:bg-slate-50 transition-colors"
      >
        <Lock className="w-4 h-4 text-slate-400" />
        Continue with SAML SSO
      </button>
    </div>
  );
}
