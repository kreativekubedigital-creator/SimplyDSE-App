import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const SECRET_KEY = 'SimplyDSE_Setup_2026';

  if (key !== SECRET_KEY) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="p-8 bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
          <p className="text-slate-600">This setup portal requires a valid activation key.</p>
        </div>
      </div>
    );
  }

  async function activateAdmin(formData: FormData) {
    'use server';
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          },
        },
      }
    );

    console.log('--- ADMIN ACTIVATION STARTED ---');
    
    // 1. Create or Update User
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existingUser = users.find(u => u.email === email);

    let userId;
    if (existingUser) {
      const { data } = await supabase.auth.admin.updateUserById(existingUser.id, { password });
      userId = data.user?.id;
    } else {
      const { data } = await supabase.auth.admin.createUser({ 
        email, 
        password, 
        email_confirm: true 
      });
      userId = data.user?.id;
    }

    if (!userId) throw new Error('Failed to setup user');

    // 2. Force Super Admin Profile
    await supabase.from('profiles').upsert({
      id: userId,
      email: email,
      role: 'super_admin',
      full_name: 'Platform Administrator'
    });

    // 3. Redirect to login
    redirect('/login?setup=success');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="p-10 bg-white rounded-3xl shadow-2xl max-w-md w-full">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">Admin Setup</h1>
          <p className="text-slate-500 mt-2">Initialize your Super Admin account</p>
        </div>

        <form action={activateAdmin} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Admin Email</label>
            <input 
              name="email"
              type="email" 
              defaultValue="kreativekubedigital@gmail.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Set New Password</label>
            <input 
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg"
          >
            Activate & Login →
          </button>
        </form>
      </div>
    </div>
  );
}
