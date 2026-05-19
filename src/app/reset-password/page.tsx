'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function checkAuthSession() {
      try {
        console.info('[reset-password] Initializing recovery session verification...');

        // 1. Parse URL query and hash parameters for session/error codes first
        const searchParams = new URLSearchParams(window.location.search);
        let urlError = searchParams.get('error') || searchParams.get('error_description');
        let originalError = searchParams.get('original_error');
        
        let tokenHash = searchParams.get('token_hash');
        let accessToken = searchParams.get('access_token');
        let refreshToken = searchParams.get('refresh_token');
        let code = searchParams.get('code');

        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          urlError = urlError || hashParams.get('error_description') || hashParams.get('error');
          originalError = originalError || hashParams.get('original_error');
          tokenHash = tokenHash || hashParams.get('token_hash');
          accessToken = accessToken || hashParams.get('access_token');
          refreshToken = refreshToken || hashParams.get('refresh_token');
          code = code || hashParams.get('code');
        }

        // 2. If we have a redirect/callback error in URL, fail fast immediately (bypass getSession)
        if (urlError) {
          let decoded = decodeURIComponent(urlError).replace(/\+/g, ' ');
          let decodedOriginal = originalError ? decodeURIComponent(originalError).replace(/\+/g, ' ') : 'none';
          console.warn('[reset-password] Callback/redirect error detected in URL:', {
            error: decoded,
            originalError: decodedOriginal
          });
          
          setLinkError('This reset link has expired or is invalid. Please request a new reset link.');
          window.history.replaceState({}, document.title, window.location.pathname);
          setCheckingSession(false);
          return;
        }

        // 3. Try to exchange PKCE code if present in URL (client-side exchange avoids email scanner consumption)
        if (code) {
          console.info('[reset-password] Found PKCE code in URL. Exchanging code for session on client...');
          const exchangePromise = supabase.auth.exchangeCodeForSession(code);
          const timeoutPromise = new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('Code exchange timed out')), 8000)
          );

          try {
            const { error: exchangeError } = await Promise.race([exchangePromise, timeoutPromise]);
            if (!exchangeError) {
              console.info('[reset-password] Code exchanged successfully on client.');
              window.history.replaceState({}, document.title, window.location.pathname);
              setCheckingSession(false);
              return;
            } else {
              console.error('[reset-password] Code exchange failed client-side:', exchangeError.message);
              setLinkError('This reset link has expired or is invalid. Please request a new reset link.');
              setCheckingSession(false);
              return;
            }
          } catch (err: any) {
            console.error('[reset-password] Code exchange error/timeout:', err.message || err);
            setLinkError('This reset link has expired or is invalid. Please request a new reset link.');
            setCheckingSession(false);
            return;
          }
        }

        // 4. Try to verify OTP token_hash if present in URL
        if (tokenHash) {
          console.info('[reset-password] Found token_hash. Verifying recovery OTP client-side...');
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery'
          });

          if (!verifyError) {
            console.info('[reset-password] token_hash verified successfully. Session established.');
            window.history.replaceState({}, document.title, window.location.pathname);
            setCheckingSession(false);
            return;
          } else {
            console.error('[reset-password] token_hash verification failed:', verifyError.message);
            setLinkError('This reset link has expired or is invalid. Please request a new reset link.');
            setCheckingSession(false);
            return;
          }
        }

        // 5. Try to establish session from access_token / refresh_token if present in URL/hash
        if (accessToken && refreshToken) {
          console.info('[reset-password] Found access_token/refresh_token. Establishing session...');
          const { data: { session: newSession }, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (!setSessionError && newSession) {
            console.info('[reset-password] Session established successfully from tokens.');
            window.history.replaceState({}, document.title, window.location.pathname);
            setCheckingSession(false);
            return;
          } else if (setSessionError) {
            console.error('[reset-password] Failed to set session from tokens:', setSessionError.message);
          }
        }

        // 6. Check if we already have an active session (with timeout to prevent hanging)
        console.info('[reset-password] No direct verification params in URL. Checking existing session...');
        const sessionPromise = supabase.auth.getSession();
        const sessionTimeoutPromise = new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('Session check timed out')), 4000)
        );

        try {
          const { data: { session: existingSession } } = await Promise.race([sessionPromise, sessionTimeoutPromise]);
          if (existingSession) {
            console.info('[reset-password] Active session found on load. Proceeding to reset form.');
            window.history.replaceState({}, document.title, window.location.pathname);
            setCheckingSession(false);
            return;
          } else {
            console.warn('[reset-password] No active session found.');
            setLinkError('This reset link has expired or is invalid. Please request a new reset link.');
          }
        } catch (err: any) {
          console.error('[reset-password] getSession error/timeout:', err.message || err);
          setLinkError('This reset link has expired or is invalid. Please request a new reset link.');
        }

      } catch (err: any) {
        console.error('[reset-password] Unexpected session check error:', err.message || err);
        setLinkError('This reset link has expired or is invalid. Please request a new reset link.');
      } finally {
        setCheckingSession(false);
      }
    }
    checkAuthSession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (password.length < 12) {
      setFormError('Password must be at least 12 characters for enterprise compliance.');
      return;
    }

    setIsSubmitting(true);

    try {
      console.info('[reset-password] Attempting password update...');
      const { error: updateError } = await supabase.auth.updateUser({ password });
      
      if (updateError) throw updateError;

      console.info('[reset-password] Password updated successfully. Resolving profile...');
      setSuccess(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, organization_id, organizations!profiles_organization_id_fkey(subdomain)')
          .eq('id', user.id)
          .single();

        const role = profile?.role;
        // @ts-ignore
        const subdomain = profile?.organizations?.subdomain;
        const hrRoles = ['organisation_admin', 'organization_admin', 'org_admin', 'hr_manager', 'compliance_manager'];

        setTimeout(() => {
          let targetOrigin = window.location.origin;

          if (role === 'super_admin') {
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'simplydse.online';
            const adminUrl = new URL(window.location.href);
            if (adminUrl.hostname !== 'localhost' && !adminUrl.hostname.endsWith('.localhost')) {
              adminUrl.hostname = `admin.${rootDomain}`;
              window.location.href = adminUrl.origin + '/';
              return;
            } else {
              router.push('/super-admin');
              return;
            }
          } else if (subdomain && subdomain !== 'www') {
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'simplydse.online';
            const urlObj = new URL(window.location.href);
            if (urlObj.hostname === 'localhost' || urlObj.hostname.endsWith('.localhost')) {
              urlObj.hostname = `${subdomain}.localhost`;
            } else {
              urlObj.hostname = `${subdomain}.${rootDomain}`;
            }
            targetOrigin = urlObj.origin;
          }

          if (hrRoles.includes(role || '')) {
            window.location.href = `${targetOrigin}/dashboard`;
          } else {
            window.location.href = `${targetOrigin}/employee`;
          }
        }, 2000);
      } else {
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      console.error('[reset-password] Failed to update password:', err.message || err);
      let errorMessage = err.message || 'Failed to update your password. Please try again.';
      if (errorMessage.includes('expired') || errorMessage.includes('token_expired') || errorMessage.includes('Auth session expired') || errorMessage.includes('invalid flow') || errorMessage.includes('User not found')) {
        setLinkError('This reset link has expired or is invalid. Please request a new reset link.');
      } else {
        setFormError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
          <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Verifying Recovery Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      {/* Minimal Header */}
      <header className="p-6 md:p-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-slate-900 transition-opacity hover:opacity-80">
          <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight">SimplyDSE Enterprise</span>
        </Link>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline-block">
          System Status: Operational
        </span>
      </header>

      {/* Main Form Area */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px]">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
              <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
                Create New Password
              </h1>
              <p className="text-slate-500 text-sm">
                Please enter a strong new password to secure your workplace account.
              </p>
            </div>

            {success ? (
              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center animate-in fade-in zoom-in-95 duration-500">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-slate-900 font-bold mb-1">Password Secured</h3>
                <p className="text-slate-500 text-xs mt-1">Redirecting you to your workspace...</p>
              </div>
            ) : linkError ? (
              <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center animate-in fade-in zoom-in-95 duration-500 space-y-4">
                <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-1 animate-pulse" />
                <div>
                  <h3 className="text-slate-900 font-bold text-lg">Reset Link Invalid or Expired</h3>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                    {linkError}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/login?forgot=true')}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl text-[13px] font-bold shadow-lg shadow-slate-900/10 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                >
                  Request a New Reset Link &rarr;
                </button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                {formError && (
                  <div className="p-4 bg-red-55 border border-red-100 rounded-2xl flex gap-3 text-red-700 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{formError}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">New Password</label>
                    <div className="relative">
                      <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                        placeholder="Minimum 12 characters"
                        required
                      />
                      <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Confirm Password</label>
                    <div className="relative">
                      <input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
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
                  className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl text-[13px] font-bold shadow-lg shadow-slate-900/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none mt-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Update Password & Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between text-[11px] font-medium text-slate-400 uppercase tracking-widest gap-4">
        <div>&copy; {new Date().getFullYear()} SimplyDSE Systems. All rights reserved.</div>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
          <Link href="/security" className="hover:text-slate-900 transition-colors flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Security
          </Link>
        </div>
      </footer>
    </div>
  );
}
