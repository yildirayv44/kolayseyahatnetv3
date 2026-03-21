import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const destination = searchParams.get('destination');

    if (!source || !destination) {
      return NextResponse.json(
        { error: 'Source and destination country codes are required' },
        { status: 400 }
      );
    }

    // Fetch visa requirement from visa_requirements table
    const { data: visaReq, error } = await supabase
      .from('visa_requirements')
      .select('*')
      .eq('source_country_code', source)
      .eq('destination_country_code', destination)
      .maybeSingle();

    if (error) {
      console.error('Visa requirement fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!visaReq) {
      return NextResponse.json({
        found: false,
        message: `No visa requirement found for ${source} → ${destination}`,
        visa_status: null,
      });
    }

    return NextResponse.json({
      found: true,
      visa_status: visaReq.visa_status,
      allowed_stay: visaReq.allowed_stay,
      conditions: visaReq.conditions,
      visa_cost: visaReq.visa_cost,
      processing_time: visaReq.processing_time,
      application_method: visaReq.application_method,
      data: visaReq,
    });
  } catch (error: any) {
    console.error('Visa requirement check error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
