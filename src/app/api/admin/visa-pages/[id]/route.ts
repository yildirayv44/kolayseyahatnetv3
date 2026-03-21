import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/admin/visa-pages/[id]
 * Get a single bilateral visa page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: visaPage, error } = await supabase
      .from('visa_pages_seo')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!visaPage) {
      return NextResponse.json(
        { success: false, error: 'Visa page not found' },
        { status: 404 }
      );
    }

    // Manually fetch country data
    const { data: countries } = await supabase
      .from('countries')
      .select('name, country_code, flag_emoji')
      .in('country_code', [visaPage.source_country_code, visaPage.destination_country_code]);

    const sourceCountry = countries?.find(c => c.country_code === visaPage.source_country_code);
    const destinationCountry = countries?.find(c => c.country_code === visaPage.destination_country_code);

    return NextResponse.json({
      success: true,
      data: {
        ...visaPage,
        source_country: sourceCountry,
        destination_country: destinationCountry
      }
    });
  } catch (error: any) {
    console.error('Get visa page error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch visa page' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/visa-pages/[id]
 * Update a bilateral visa page
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      meta_title,
      meta_description,
      h1_title,
      intro_text,
      requirements_section,
      process_section,
      faq_json,
      custom_content,
      use_custom_content,
      content_status
    } = body;

    const updateData: any = {};

    if (meta_title !== undefined) updateData.meta_title = meta_title;
    if (meta_description !== undefined) updateData.meta_description = meta_description;
    if (h1_title !== undefined) updateData.h1_title = h1_title;
    if (intro_text !== undefined) updateData.intro_text = intro_text;
    if (requirements_section !== undefined) updateData.requirements_section = requirements_section;
    if (process_section !== undefined) updateData.process_section = process_section;
    if (faq_json !== undefined) updateData.faq_json = faq_json;
    if (custom_content !== undefined) updateData.custom_content = custom_content;
    if (use_custom_content !== undefined) updateData.use_custom_content = use_custom_content;
    if (content_status !== undefined) {
      updateData.content_status = content_status;
      if (content_status === 'reviewed') {
        updateData.reviewed_at = new Date().toISOString();
      } else if (content_status === 'published') {
        updateData.published_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('visa_pages_seo')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: 'Visa page updated successfully'
    });
  } catch (error: any) {
    console.error('Update visa page error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update visa page' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/visa-pages/[id]
 * Delete a bilateral visa page
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('visa_pages_seo')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Visa page deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete visa page error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete visa page' },
      { status: 500 }
    );
  }
}
