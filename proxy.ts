import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export default async function handler(request: Request) {
  const { pathname } = new URL(request.url)

  // Only handle Supabase auth routes
  if (!pathname.startsWith("/auth/")) {
    return new Response("Not found", { status: 404 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const { error } = await supabase.auth.getUser()

  if (error) {
    return Response.redirect(new URL("/auth/login", request.url))
  }

  return new Response("OK", { status: 200 })
}
