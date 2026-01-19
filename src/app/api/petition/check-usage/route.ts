import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { headers } from "next/headers";
import { cookies } from "next/headers";

const USAGE_COOKIE_NAME = "petition_usage";
const MAX_FREE_USAGE = 1;

export async function GET() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      return NextResponse.json({ blocked: false, isAuthenticated: true, remaining: "unlimited" });
    }
    
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ip = forwardedFor?.split(",")[0] || realIp || "unknown";
    
    const cookieStore = await cookies();
    const usageCookie = cookieStore.get(USAGE_COOKIE_NAME);
    const clientId = usageCookie?.value || ip;
    
    const { data: usage } = await supabase
      .from("petition_usage")
      .select("count")
      .eq("client_id", clientId)
      .single();
    
    const currentCount = usage?.count || 0;
    const blocked = currentCount >= MAX_FREE_USAGE;
    const remaining = Math.max(0, MAX_FREE_USAGE - currentCount);
    
    return NextResponse.json({ 
      blocked, 
      isAuthenticated: false, 
      remaining,
      used: currentCount,
      limit: MAX_FREE_USAGE
    });
  } catch (error) {
    console.error("Check usage error:", error);
    return NextResponse.json({ blocked: false, isAuthenticated: false, remaining: MAX_FREE_USAGE });
  }
}
