/**
 * Fix RLS Policy for visa_pages_seo table
 * Allows authenticated users to INSERT bilateral visa pages
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicy() {
  console.log('🔧 Fixing RLS policy for visa_pages_seo table...');

  try {
    // Execute the RLS policy fix SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing policies
        DROP POLICY IF EXISTS "Allow authenticated users to manage visa pages" ON visa_pages_seo;
        DROP POLICY IF EXISTS "Allow public read access to published visa pages" ON visa_pages_seo;

        -- Create new policy for authenticated users (full access)
        CREATE POLICY "Allow authenticated users full access to visa pages"
          ON visa_pages_seo
          FOR ALL
          TO authenticated
          USING (true)
          WITH CHECK (true);

        -- Create policy for public read access
        CREATE POLICY "Allow public read access to published visa pages"
          ON visa_pages_seo
          FOR SELECT
          TO public
          USING (content_status = 'published' OR content_status = 'generated');

        -- Ensure RLS is enabled
        ALTER TABLE visa_pages_seo ENABLE ROW LEVEL SECURITY;
      `
    });

    if (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }

    console.log('✅ RLS policy fixed successfully!');
    console.log('');
    console.log('Test now:');
    console.log('http://localhost:3000/admin/ulkeler/27/bilateral-vize');
  } catch (error) {
    console.error('❌ Failed to fix RLS policy:', error);
    process.exit(1);
  }
}

fixRLSPolicy();
