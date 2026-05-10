import { useState, useEffect } from 'react';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getTenantInfo } from '../utils/multi-tenancy';
import type { TenantConfig } from '../utils/multi-tenancy';
import Reveal from '../components/ui/Reveal';

const Login = () => {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTenant(getTenantInfo());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Logic for auth will go here
    setTimeout(() => setIsSubmitting(false), 2000);
  };

  if (!tenant) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-[440px] relative z-10">
        <Reveal direction="up" delay={0.1}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl shadow-brand-primary/10 border border-border-subtle mb-6">
              <Shield className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
              {tenant.id === 'main' ? 'Log in to SimplyDSE' : `Log in to ${tenant.name}`}
            </h1>
            <p className="text-text-secondary mt-3 font-medium">
              Secure access to your enterprise compliance portal.
            </p>
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.2}>
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full bg-white/50 border border-border-strong rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-text-primary font-medium placeholder:text-text-muted/50"
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
                    className="w-full bg-white/50 border border-border-strong rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-text-primary font-medium placeholder:text-text-muted/50"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <div className="flex h-5 items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-5 w-5 rounded-lg border-border-strong text-brand-primary focus:ring-brand-primary transition-all cursor-pointer"
                  />
                </div>
                <label htmlFor="remember" className="text-sm font-bold text-text-secondary cursor-pointer select-none">
                  Remember this device
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-enterprise-primary !py-4 rounded-2xl flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10">Sign In</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.3}>
          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 text-text-muted">
              <CheckCircle2 className="w-4 h-4 text-brand-primary" />
              <span className="text-xs font-bold uppercase tracking-wider">Multi-Tenant Protected</span>
            </div>
            
            <p className="text-xs text-text-muted text-center leading-relaxed px-10">
              By signing in, you agree to SimplyDSE’s 
              <button className="text-text-primary hover:text-brand-primary transition-colors mx-1">Terms of Service</button> 
              and 
              <button className="text-text-primary hover:text-brand-primary transition-colors mx-1">Privacy Policy</button>.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default Login;
