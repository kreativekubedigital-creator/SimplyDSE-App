import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight, X, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getWorkspaceInfo } from '../utils/multi-tenancy';
import type { WorkspaceConfig } from '../utils/multi-tenancy';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const router = useRouter();
  const [Workspace, setWorkspace] = useState<WorkspaceConfig | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWorkspace(getWorkspaceInfo());
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized. Check your environment variables.');
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // Fetch user role to determine redirection
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        // Successful login - Redirect based on role
        if (profile?.role === 'super_admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        onClose();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    try {
      setIsSubmitting(true);
      setError(null);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden border border-white/20"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 text-text-muted hover:text-text-primary transition-all z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 mb-4">
                  <Shield className="w-7 h-7 text-brand-primary" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                  {Workspace?.id === 'main' ? 'Enterprise Login' : `Log in to ${Workspace?.name}`}
                </h2>
                <p className="text-text-secondary mt-2 text-sm font-medium">
                  Secure access to your DSE compliance portal.
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-rose-800 leading-relaxed">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">
                    Work Email
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-border-strong rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-text-primary font-medium placeholder:text-text-muted/50 text-sm"
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                      Password
                    </label>
                    <button type="button" className="text-[10px] font-black uppercase tracking-[0.1em] text-brand-primary hover:opacity-70 transition-opacity">
                      Forgot?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors z-10">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-border-strong rounded-2xl py-3.5 pl-12 pr-12 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-text-primary font-medium placeholder:text-text-muted/50 text-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-enterprise-primary !py-4 rounded-2xl flex items-center justify-center gap-3 group relative overflow-hidden mt-8"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="relative z-10 text-sm font-bold">Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
                  <span className="bg-white px-4 text-text-muted">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleOAuthLogin('google')}
                  className="flex items-center justify-center gap-3 py-3 px-4 bg-white border border-border-strong rounded-2xl hover:bg-slate-50 transition-all group shadow-sm"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-[11px] font-bold text-text-primary">Google</span>
                </button>
                <button
                  onClick={() => handleOAuthLogin('azure')}
                  className="flex items-center justify-center gap-3 py-3 px-4 bg-white border border-border-strong rounded-2xl hover:bg-slate-50 transition-all group shadow-sm"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  <span className="text-[11px] font-bold text-text-primary">Microsoft</span>
                </button>
              </div>

              <div className="mt-8 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-text-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em]">Multi-Workspace Protected</span>
                </div>
                <p className="text-[10px] text-text-muted text-center leading-relaxed max-w-[240px]">
                  Protected by SimplyDSE security protocols. 
                  <button className="text-text-primary hover:text-brand-primary transition-colors mx-1">Privacy Policy</button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
