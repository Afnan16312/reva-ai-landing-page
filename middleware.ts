import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/dashboard", "/api/appointments", "/api/patients", "/api/whatsapp/send", "/api/reminders"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;

  // Only run on protected routes
  const isProtected = PROTECTED.some(p => path.startsWith(p));
  if (!isProtected) return res;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // API routes → 401
  if (!user && path.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Page routes → redirect to login
  if (!user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/appointments/:path*", "/api/patients/:path*", "/api/whatsapp/send", "/api/reminders"],
};
