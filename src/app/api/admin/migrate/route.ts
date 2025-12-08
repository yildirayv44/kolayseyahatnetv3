import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Running database migration...");

    // Migration SQL
    const migrationSQL = `
      -- Add extended fields to countries table for AI-generated content
      
      -- SEO fields
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS meta_description TEXT;
      
      -- Visa details
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS visa_type VARCHAR(255);
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS max_stay_duration VARCHAR(255);
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS visa_fee VARCHAR(255);
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS processing_time VARCHAR(255);
      
      -- JSON array fields
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS application_steps JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS required_documents JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS important_notes JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS travel_tips JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS popular_cities JSONB DEFAULT '[]'::jsonb;
      
      -- Text fields
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS best_time_to_visit TEXT;
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS health_requirements TEXT;
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS customs_regulations TEXT;
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS why_kolay_seyahat TEXT;
      
      -- JSON object field
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS emergency_contacts JSONB DEFAULT '{}'::jsonb;
      
      -- Country info
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS capital VARCHAR(255);
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS currency VARCHAR(255);
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS language VARCHAR(255);
      ALTER TABLE countries ADD COLUMN IF NOT EXISTS timezone VARCHAR(255);
    `;

    // Execute migration using RPC
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    });

    if (error) {
      console.error("Migration error:", error);
      
      // If RPC doesn't exist, provide manual instructions
      if (error.message.includes('function') || error.message.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          error: "RPC function not available",
          message: "Please run the migration manually in Supabase SQL Editor",
          sql: migrationSQL
        }, { status: 200 });
      }
      
      throw error;
    }

    console.log("✅ Migration completed successfully");

    return NextResponse.json({
      success: true,
      message: "Database migration completed successfully",
      columnsAdded: [
        "meta_description",
        "visa_type",
        "max_stay_duration",
        "visa_fee",
        "processing_time",
        "application_steps",
        "required_documents",
        "important_notes",
        "travel_tips",
        "popular_cities",
        "best_time_to_visit",
        "health_requirements",
        "customs_regulations",
        "emergency_contacts",
        "why_kolay_seyahat",
        "capital",
        "currency",
        "language",
        "timezone"
      ]
    });

  } catch (error: any) {
    console.error("Migration failed:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        hint: "You may need to run the migration manually in Supabase SQL Editor"
      },
      { status: 500 }
    );
  }
}
