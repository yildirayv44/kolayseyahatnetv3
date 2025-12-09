import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // Fetch PassportIndex data
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/admin/visa-requirements/fetch-passportindex`
    );
    const { data: passportData } = await response.json();

    if (!passportData) {
      return NextResponse.json({ error: "No PassportIndex data" }, { status: 500 });
    }

    let updated = 0;
    let created = 0;
    const errors: string[] = [];

    for (const item of passportData) {
      try {
        // Parse available methods from conditions and visaStatus
        const availableMethods: string[] = [];
        
        // Check visa status
        if (item.visaStatus === "visa-free") {
          availableMethods.push("visa-free");
        } else if (item.visaStatus === "visa-on-arrival") {
          availableMethods.push("visa-on-arrival");
        }
        
        // Check conditions for additional methods
        const conditions = (item.conditions || "").toLowerCase();
        if (conditions.includes("evisa") || conditions.includes("e-visa")) {
          if (!availableMethods.includes("evisa")) {
            availableMethods.push("evisa");
          }
        }
        if (conditions.includes("visa on arrival") || conditions.includes("on arrival")) {
          if (!availableMethods.includes("visa-on-arrival")) {
            availableMethods.push("visa-on-arrival");
          }
        }
        if (conditions.includes("embassy") || conditions.includes("visa required")) {
          if (!availableMethods.includes("embassy")) {
            availableMethods.push("embassy");
          }
        }

        // If no methods detected, default to visa-required
        if (availableMethods.length === 0) {
          availableMethods.push("embassy");
        }

        // Determine primary visa_status
        let primaryStatus = "visa-required";
        if (availableMethods.includes("visa-free")) {
          primaryStatus = "visa-free";
        } else if (availableMethods.includes("visa-on-arrival")) {
          primaryStatus = "visa-on-arrival";
        } else if (availableMethods.includes("evisa")) {
          primaryStatus = "eta";
        }

        const updateData = {
          country_code: item.countryCode,
          country_name: item.countryName,
          visa_status: primaryStatus,
          allowed_stay: item.allowedStay,
          conditions: item.conditions,
          application_method: item.applicationMethod || availableMethods[0],
          available_methods: availableMethods,
          data_source: "PassportIndex",
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("visa_requirements")
          .upsert(updateData, { onConflict: "country_code" });

        if (error) {
          errors.push(`${item.countryCode}: ${error.message}`);
        } else {
          updated++;
        }
      } catch (error: any) {
        errors.push(`${item.countryCode}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      total: passportData.length,
      updated,
      created,
      errors: errors.slice(0, 10), // First 10 errors only
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
