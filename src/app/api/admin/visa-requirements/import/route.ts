import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Import visa requirements data into the database
 * This endpoint fetches data from PassportIndex and imports it
 */

export async function POST(request: NextRequest) {
  try {
    // Fetch data from PassportIndex endpoint
    const baseUrl = request.nextUrl.origin;
    const response = await fetch(`${baseUrl}/api/admin/visa-requirements/fetch-passportindex`);
    const { data: visaData } = await response.json();

    if (!visaData || visaData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data to import' },
        { status: 400 }
      );
    }

    console.log(`📥 Importing ${visaData.length} visa requirements...`);

    let imported = 0;
    let updated = 0;
    let errors = 0;
    const errorDetails: any[] = [];

    // Import each record
    for (const item of visaData) {
      try {
        const { data: existing, error: checkError } = await supabase
          .from('visa_requirements')
          .select('id')
          .eq('country_code', item.countryCode)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 = not found, which is expected for new records
          console.error(`❌ Check error for ${item.countryCode}:`, checkError);
          errors++;
          errorDetails.push({ country: item.countryCode, error: checkError.message });
          continue;
        }

        if (existing) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('visa_requirements')
            .update({
              country_name: item.countryName,
              visa_status: item.visaStatus,
              allowed_stay: item.allowedStay || null,
              conditions: item.conditions || null,
              visa_cost: item.visaCost || null,
              processing_time: item.processingTime || null,
              application_method: item.applicationMethod || null,
              last_updated: new Date().toISOString(),
            })
            .eq('country_code', item.countryCode);

          if (updateError) {
            console.error(`❌ Update error for ${item.countryCode}:`, updateError);
            errors++;
            errorDetails.push({ country: item.countryCode, error: updateError.message });
          } else {
            updated++;
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('visa_requirements')
            .insert({
              country_code: item.countryCode,
              country_name: item.countryName,
              visa_status: item.visaStatus,
              allowed_stay: item.allowedStay || null,
              conditions: item.conditions || null,
              visa_cost: item.visaCost || null,
              processing_time: item.processingTime || null,
              application_method: item.applicationMethod || null,
              data_source: 'PassportIndex',
            });

          if (insertError) {
            console.error(`❌ Insert error for ${item.countryCode}:`, insertError);
            errors++;
            errorDetails.push({ country: item.countryCode, error: insertError.message });
          } else {
            imported++;
          }
        }
      } catch (itemError: any) {
        console.error(`❌ Error processing ${item.countryCode}:`, itemError);
        errors++;
        errorDetails.push({ country: item.countryCode, error: itemError.message });
      }
    }

    console.log(`✅ Import complete: ${imported} imported, ${updated} updated, ${errors} errors`);

    return NextResponse.json({
      success: true,
      message: 'Visa requirements imported successfully',
      stats: {
        total: visaData.length,
        imported,
        updated,
        errors,
      },
      errorDetails: errorDetails.length > 0 ? errorDetails.slice(0, 10) : undefined, // Show first 10 errors
    });
  } catch (error: any) {
    console.error('❌ Import error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check import status
export async function GET(request: NextRequest) {
  try {
    const { data, error, count } = await supabase
      .from('visa_requirements')
      .select('*', { count: 'exact' });

    if (error) throw error;

    // Group by visa status
    const stats = {
      total: count || 0,
      visaFree: data?.filter(r => r.visa_status === 'visa-free').length || 0,
      visaOnArrival: data?.filter(r => r.visa_status === 'visa-on-arrival').length || 0,
      eta: data?.filter(r => r.visa_status === 'eta').length || 0,
      evisa: data?.filter(r => r.visa_status === 'evisa').length || 0,
      visaRequired: data?.filter(r => r.visa_status === 'visa-required').length || 0,
    };

    return NextResponse.json({
      success: true,
      stats,
      lastUpdated: data?.[0]?.last_updated || null,
    });
  } catch (error: any) {
    console.error('Error fetching visa requirements stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
