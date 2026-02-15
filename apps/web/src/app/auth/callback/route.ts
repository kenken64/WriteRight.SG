import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const next = searchParams.get('next') ?? '/assignments';
  const type = searchParams.get('type');

  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const origin = `${protocol}://${host}`;

  // Default redirect (error case)
  let redirectTo = `${origin}/login?error=auth_callback_error`;

  // Create a redirect response first, then attach cookies to IT
  // (Using cookies() from next/headers doesn't carry over to NextResponse.redirect)
  const createSupabaseWithResponse = (response: NextResponse) => {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: '', ...options });
          },
        },
      },
    );
  };

  // Handle password recovery flow (token_hash from email link)
  if (tokenHash && type === 'recovery') {
    const response = NextResponse.redirect(`${origin}/reset-password`);
    const supabase = createSupabaseWithResponse(response);
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery',
    });
    if (!error) {
      return response; // cookies are already on this response
    }
    // Fall through to error redirect
  }

  // Handle standard auth code exchange (login, signup confirmation, etc.)
  if (code && type !== 'recovery') {
    const response = NextResponse.redirect(`${origin}${next}`);
    const supabase = createSupabaseWithResponse(response);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(redirectTo);
}
