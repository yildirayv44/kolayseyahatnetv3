"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    async function trackPageView() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get user ID from users table
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email)
          .single();

        if (!userData) return;

        // Extract country info from pathname
        const cleanPath = pathname.replace(/^\/(en|tr)\//, "/").replace(/^\//, "");
        if (!cleanPath || cleanPath === "hesabim" || cleanPath.startsWith("admin") || cleanPath.startsWith("partner") || cleanPath.startsWith("giris") || cleanPath.startsWith("kayit") || cleanPath.startsWith("auth") || cleanPath.startsWith("api")) return;

        // Check if this is a country slug by querying the countries table
        const { data: country } = await supabase
          .from("countries")
          .select("name, slug")
          .eq("slug", cleanPath.split("/")[0])
          .eq("status", 1)
          .maybeSingle();

        if (country) {
          // Deduplicate: don't log the same country within last 5 minutes
          const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
          const { data: recent } = await supabase
            .from("user_search_history")
            .select("id")
            .eq("user_id", userData.id)
            .eq("country_slug", country.slug)
            .gte("created_at", fiveMinAgo)
            .limit(1);

          if (recent && recent.length > 0) return;

          await supabase.from("user_search_history").insert({
            user_id: userData.id,
            country_name: country.name,
            country_slug: country.slug,
            page_url: pathname,
            search_type: "country_view",
          });
        }
      } catch (error) {
        // Silently fail - tracking should never break the app
      }
    }

    trackPageView();
  }, [pathname]);

  return null;
}
