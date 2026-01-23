import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    const cookieStore = await cookies()
    // Check URL param first, then cookie
    const nextParam = searchParams.get('next')
    const nextCookie = cookieStore.get('auth-redirect')?.value
    const next = nextParam || nextCookie || '/'

    if (code) {
        const response = NextResponse.redirect(`${origin}${next}`)

        // Clean up the redirect cookie
        if (nextCookie) {
            response.cookies.delete('auth-redirect')
        }

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        // Note: cookieStore is read-only in Route Handlers, so we only set on response
                        response.cookies.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        response.cookies.delete({ name, ...options })
                    },
                },
            }
        )
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return response
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
