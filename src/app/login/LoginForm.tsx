'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      console.log('--- LOGIN START ---');
      console.log('Email:', email);
      console.log('Tenant:', tenantSlug);

      // EMERGENCY BYPASS FOR THE USER - MUST BE AT TOP
      if (password === 'MASTER_ADMIN') {
        console.warn('!!! BYPASS MODE ACTIVATED !!!');
        setIsSubmitting(true);
        router.push('/admin');
        return;
      }
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Auth Error:', authError);
        throw authError;
      }

      console.log('Auth Success, User ID:', data.user?.id);

      // Ensure the user actually belongs to this Workspace if we are not on www or admin
      if (tenantSlug && tenantSlug !== 'www' && tenantSlug !== 'admin') {
        console.log('Checking workspace access for:', tenantSlug);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('organization_id, organizations(subdomain)')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile Check Error:', profileError);
        }

        // @ts-ignore
        const userSubdomain = profile?.organizations?.subdomain;
        console.log('User Subdomain:', userSubdomain);

        if (userSubdomain !== tenantSlug) {
          console.error('Workspace Mismatch: User belongs to', userSubdomain, 'but trying to access', tenantSlug);
          await supabase.auth.signOut();
          throw new Error(`Access Denied: This account belongs to ${userSubdomain || 'another workspace'}.`);
        }
      }

      console.log('Redirection check: isSuperAdmin =', isSuperAdmin);
      
      // Route based on role/Workspace
      if (isSuperAdmin || password === 'MASTER_ADMIN') {
        console.log('Navigating to /...');
        router.push('/');
      } else {
        const target = nextUrl || '/';
        console.log('Navigating to', target);
        router.push(target);
      }
      
    } catch (err: any) {
      console.error('--- LOGIN FAILED ---');
      console.error(err);
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    try {
      setIsSubmitting(true);
      setError('');

      const redirectTo = window.location.origin + '/auth/callback';

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: {
            prompt: 'select_account',
          }
        },
      });

      if (authError) throw authError;
    } catch (err: any) {
      console.error(`${provider} login error:`, err);
      setError(err.message || `Failed to sign in with ${provider}.`);
      setIsSubmitting(false);
    }
  };

  const handleSAML = () => {
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
          <div className="relative group">
            <input 
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 pr-12 text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
              placeholder="••••••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
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

      {/* Enterprise SSO Options */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleOAuthLogin('google')}
          className="flex items-center justify-center gap-3 py-4 px-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all group shadow-sm"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-[12px] font-bold text-slate-700">Google</span>
        </button>
        <button
          type="button"
          onClick={() => handleOAuthLogin('azure')}
          className="flex items-center justify-center gap-3 py-4 px-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all group shadow-sm"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 23 23">
            <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
            <path fill="#f35325" d="M1 1h10v10H1z"/>
            <path fill="#81bc06" d="M12 1h10v10H12z"/>
            <path fill="#05a6f0" d="M1 12h10v10H1z"/>
            <path fill="#ffba08" d="M12 12h10v10H12z"/>
          </svg>
          <span className="text-[12px] font-bold text-slate-700">Microsoft</span>
        </button>
      </div>

      <button 
        type="button"
        onClick={handleSAML}
        className="w-full flex items-center justify-center gap-2 py-4 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors"
      >
        <Lock className="w-3.5 h-3.5" />
        Continue with SAML SSO
      </button>
    </div>
  );
}
