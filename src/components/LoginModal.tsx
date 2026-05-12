import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getWorkspaceInfo } from '../utils/multi-tenancy';
import type { WorkspaceConfig } from '../utils/multi-tenancy';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [Workspace, setWorkspace] = useState<WorkspaceConfig | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      // Auth logic will go here
    }, 2000);
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
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-border-strong rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-text-primary font-medium placeholder:text-text-muted/50 text-sm"
                      placeholder="••••••••"
                      required
                    />
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
