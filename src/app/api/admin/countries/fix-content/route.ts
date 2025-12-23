import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { countryId } = body;

    if (!countryId) {
      return NextResponse.json({ error: 'countryId is required' }, { status: 400 });
    }

    // Fetch the country
    const { data: country, error: fetchError } = await supabaseAdmin
      .from('countries')
      .select('id, name, contents')
      .eq('id', countryId)
      .single();

    if (fetchError || !country) {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 });
    }

    let content = country.contents || '';
    const originalLength = content.length;

    // Remove markdown code block markers
    // Remove ```html at the start
    content = content.replace(/^```html\s*\n?/i, '');
    content = content.replace(/^```\s*\n?/, '');
    
    // Remove ``` at the end
    content = content.replace(/\n?```\s*$/g, '');

    // Trim whitespace
    content = content.trim();

    // Update the country
    const { error: updateError } = await supabaseAdmin
      .from('countries')
      .update({ contents: content })
      .eq('id', countryId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      countryId,
      countryName: country.name,
      originalLength,
      newLength: content.length,
      charactersRemoved: originalLength - content.length,
    });
  } catch (error) {
    console.error('Error fixing content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
