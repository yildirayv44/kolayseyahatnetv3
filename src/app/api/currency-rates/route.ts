import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Check if we have today's rates in cache
    const { data: cachedRate, error: cacheError } = await supabase
      .from('currency_rates')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (cachedRate && !cacheError) {
      return NextResponse.json({
        success: true,
        cached: true,
        date: cachedRate.date,
        rates: {
          USD: {
            buying: parseFloat(cachedRate.usd_buying),
            selling: parseFloat(cachedRate.usd_selling),
          },
          EUR: {
            buying: parseFloat(cachedRate.eur_buying),
            selling: parseFloat(cachedRate.eur_selling),
          },
        },
      });
    }

    // Fetch fresh rates from TCMB
    const response = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml');
    const xmlText = await response.text();

    // Parse XML using regex (simple approach for server-side)
    let usdBuying = 0;
    let usdSelling = 0;
    let eurBuying = 0;
    let eurSelling = 0;

    // Extract USD rates
    const usdMatch = xmlText.match(/<Currency[^>]*CurrencyCode="USD"[^>]*>[\s\S]*?<ForexBuying>([\d.]+)<\/ForexBuying>[\s\S]*?<ForexSelling>([\d.]+)<\/ForexSelling>/);
    if (usdMatch) {
      usdBuying = parseFloat(usdMatch[1]);
      usdSelling = parseFloat(usdMatch[2]);
    }

    // Extract EUR rates
    const eurMatch = xmlText.match(/<Currency[^>]*CurrencyCode="EUR"[^>]*>[\s\S]*?<ForexBuying>([\d.]+)<\/ForexBuying>[\s\S]*?<ForexSelling>([\d.]+)<\/ForexSelling>/);
    if (eurMatch) {
      eurBuying = parseFloat(eurMatch[1]);
      eurSelling = parseFloat(eurMatch[2]);
    }

    if (usdBuying === 0 || eurBuying === 0) {
      throw new Error('Failed to parse currency rates from TCMB');
    }

    // Save to database
    const { error: insertError } = await supabase
      .from('currency_rates')
      .upsert({
        date: today,
        usd_buying: usdBuying,
        usd_selling: usdSelling,
        eur_buying: eurBuying,
        eur_selling: eurSelling,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'date',
      });

    if (insertError) {
      console.error('Failed to cache currency rates:', insertError);
    }

    return NextResponse.json({
      success: true,
      cached: false,
      date: today,
      rates: {
        USD: {
          buying: usdBuying,
          selling: usdSelling,
        },
        EUR: {
          buying: eurBuying,
          selling: eurSelling,
        },
      },
    });
  } catch (error) {
    console.error('Currency rates API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch currency rates' },
      { status: 500 }
    );
  }
}
