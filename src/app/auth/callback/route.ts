import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(new URL("/giris?error=auth_failed", request.url));
    }

    // Check if user is admin from users table
    if (data?.user) {
      const { data: userData } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", data.user.id)
        .single();

      if (userData?.is_admin === 1) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }

    // Regular users go to home page
    return NextResponse.redirect(new URL("/", request.url));
  }

  // No code provided, redirect to home
  return NextResponse.redirect(new URL("/", request.url));
}
