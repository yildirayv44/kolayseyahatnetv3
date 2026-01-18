import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { headers } from "next/headers";
import { cookies } from "next/headers";

const USAGE_COOKIE_NAME = "invitation_usage";
const MAX_FREE_USAGE = 1;

async function getClientIdentifier(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0] || realIp || "unknown";
  
  const cookieStore = await cookies();
  const usageCookie = cookieStore.get(USAGE_COOKIE_NAME);
  
  return usageCookie?.value || ip;
}

export async function GET() {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Authenticated users have unlimited access
      return NextResponse.json({ blocked: false, isAuthenticated: true, remaining: -1 });
    }
    
    const clientId = await getClientIdentifier();
    
    // Check usage in database
    const { data: usage } = await supabase
      .from("invitation_usage")
      .select("count")
      .eq("client_id", clientId)
      .single();
    
    if (!usage) {
      return NextResponse.json({ 
        blocked: false, 
        isAuthenticated: false, 
        remaining: MAX_FREE_USAGE 
      });
    }
    
    const remaining = Math.max(0, MAX_FREE_USAGE - usage.count);
    
    return NextResponse.json({ 
      blocked: usage.count >= MAX_FREE_USAGE, 
      isAuthenticated: false,
      remaining 
    });
  } catch (error) {
    console.error("Usage check error:", error);
    return NextResponse.json({ blocked: false, isAuthenticated: false, remaining: MAX_FREE_USAGE });
  }
}
