import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return NextResponse.json({ session });
}
