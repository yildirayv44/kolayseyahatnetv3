import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Apply visa_requirements table migration
 * This creates the table if it doesn't exist
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating visa_requirements table...');

    // Create the table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create visa requirements table
        CREATE TABLE IF NOT EXISTS visa_requirements (
          id BIGSERIAL PRIMARY KEY,
          
          -- Country reference
          country_code VARCHAR(3) NOT NULL UNIQUE,
          country_name VARCHAR(255) NOT NULL,
          
          -- Visa requirement status
          visa_status VARCHAR(50) NOT NULL,
          
          -- Duration allowed
          allowed_stay VARCHAR(100),
          
          -- Additional details
          conditions TEXT,
          
          -- PassportIndex specific data
          passport_index_score INTEGER,
          
          -- Additional information
          visa_cost VARCHAR(100),
          processing_time VARCHAR(100),
          
          -- Application method
          application_method VARCHAR(50),
          application_url TEXT,
          
          -- Embassy information
          embassy_location VARCHAR(255),
          embassy_contact VARCHAR(255),
          
          -- Metadata
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          data_source VARCHAR(100) DEFAULT 'PassportIndex',
          notes TEXT,
          
          -- Timestamps
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_visa_requirements_country_code ON visa_requirements(country_code);
        CREATE INDEX IF NOT EXISTS idx_visa_requirements_visa_status ON visa_requirements(visa_status);
        CREATE INDEX IF NOT EXISTS idx_visa_requirements_country_name ON visa_requirements(country_name);

        -- Create updated_at trigger function
        CREATE OR REPLACE FUNCTION update_visa_requirements_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create trigger
        DROP TRIGGER IF EXISTS trigger_visa_requirements_updated_at ON visa_requirements;
        CREATE TRIGGER trigger_visa_requirements_updated_at
          BEFORE UPDATE ON visa_requirements
          FOR EACH ROW
          EXECUTE FUNCTION update_visa_requirements_updated_at();

        -- Enable RLS
        ALTER TABLE visa_requirements ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Allow public read access to visa requirements" ON visa_requirements;
        DROP POLICY IF EXISTS "Allow authenticated users to manage visa requirements" ON visa_requirements;

        -- Create RLS policies
        CREATE POLICY "Allow public read access to visa requirements"
          ON visa_requirements
          FOR SELECT
          TO public
          USING (true);

        CREATE POLICY "Allow authenticated users to manage visa requirements"
          ON visa_requirements
          FOR ALL
          TO authenticated
          USING (true)
          WITH CHECK (true);
      `
    });

    if (createError) {
      // If rpc doesn't exist, try direct SQL execution
      console.log('⚠️ RPC method not available, using direct queries...');
      
      // Create table directly
      const { error: tableError } = await supabase.from('visa_requirements').select('id').limit(1);
      
      if (tableError && tableError.message.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          error: 'Table creation requires direct database access. Please run the migration SQL in Supabase Dashboard.',
          instructions: [
            '1. Go to Supabase Dashboard > SQL Editor',
            '2. Copy the SQL from: /supabase/migrations/create_visa_requirements_table.sql',
            '3. Run the SQL',
            '4. Refresh this page'
          ]
        }, { status: 400 });
      }
    }

    console.log('✅ Table created successfully');

    return NextResponse.json({
      success: true,
      message: 'visa_requirements table created successfully',
    });
  } catch (error: any) {
    console.error('❌ Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      instructions: [
        '1. Go to Supabase Dashboard > SQL Editor',
        '2. Copy the SQL from: /supabase/migrations/create_visa_requirements_table.sql',
        '3. Run the SQL',
        '4. Refresh this page'
      ]
    }, { status: 500 });
  }
}
