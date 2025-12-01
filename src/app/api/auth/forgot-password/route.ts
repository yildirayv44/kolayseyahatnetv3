import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "E-posta adresi gerekli" },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .single();

    if (userError || !user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message: "Eğer bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.",
      });
    }

    // Send password reset email using Supabase Auth
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/sifre-sifirla`,
      }
    );

    if (resetError) {
      console.error("Password reset error:", resetError);
      return NextResponse.json(
        { error: "Şifre sıfırlama bağlantısı gönderilemedi" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
