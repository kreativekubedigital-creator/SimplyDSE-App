import { headers } from 'next/headers';
import LoginForm from './LoginForm';
import { Building2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || '';
  const isSuperAdmin = tenantSlug === 'admin';
  const isPublic = tenantSlug === 'www' || !tenantSlug;

  let tenantName = 'SimplyDSE';
  let hasValidWorkspace = true;

  if (!isPublic && !isSuperAdmin) {
    // If we're on a Workspace subdomain, let's optionally fetch their display name
    // For extreme performance we could just capitalize the slug, but fetching is more enterprise.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      }
    );

    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('subdomain', tenantSlug)
      .single();

    if (org) {
      tenantName = org.name;
    } else {
      hasValidWorkspace = false;
    }
  }

  if (isSuperAdmin) {
    tenantName = 'Platform Administration';
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

      {/* Main Login Area */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px]">
          {!hasValidWorkspace ? (
            <div className="text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workspace Not Found</h1>
              <p className="text-slate-500 mt-2 text-sm">
                The organisation workspace at <strong>{tenantSlug}.simplydse.com</strong> does not exist.
              </p>
              <Link href="https://www.simplydse.com" className="inline-block mt-8 text-sm font-medium text-brand-primary hover:underline">
                Return to SimplyDSE.com
              </Link>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center space-y-2">
                <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
                  {isPublic ? 'Sign in to SimplyDSE' : `Sign in to ${tenantName}`}
                </h1>
                <p className="text-slate-500 text-sm">
                  {isSuperAdmin 
                    ? 'Enter your administrative credentials' 
                    : 'Use your workplace credentials to access your workspace'}
                </p>
              </div>

              <LoginForm tenantSlug={tenantSlug} nextUrl={params.next} isSuperAdmin={isSuperAdmin} />
            </div>
          )}
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
