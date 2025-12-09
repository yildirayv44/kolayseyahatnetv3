import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get all visa requirements
    const { data: visaReqs, error } = await supabase
      .from("visa_requirements")
      .select("country_code, country_name, visa_status, available_methods, conditions")
      .order("country_name");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter countries with multiple methods
    const multiMethod = visaReqs?.filter(
      (req) => req.available_methods && req.available_methods.length > 1
    ) || [];

    // Group by number of methods
    const byMethodCount = multiMethod.reduce((acc, req) => {
      const count = req.available_methods.length;
      if (!acc[count]) acc[count] = [];
      acc[count].push({
        country_name: req.country_name,
        country_code: req.country_code,
        methods: req.available_methods,
        conditions: req.conditions,
      });
      return acc;
    }, {} as Record<number, any[]>);

    return NextResponse.json({
      total_countries: visaReqs?.length || 0,
      multi_method_count: multiMethod.length,
      by_method_count: byMethodCount,
      examples: multiMethod.slice(0, 10).map(req => ({
        country: req.country_name,
        code: req.country_code,
        methods: req.available_methods,
        conditions: req.conditions,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
