import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/mobile/applications
 * 
 * Submit a new visa application
 * 
 * Request body:
 * {
 *   fullName: string (required),
 *   email: string (required),
 *   phone: string (required),
 *   countryId: number (optional),
 *   countryName: string (optional),
 *   packageId: number (optional),
 *   packageName: string (optional),
 *   notes: string (optional)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   applicationId?: number
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { 
      fullName, 
      email, 
      phone, 
      countryId, 
      countryName,
      packageId, 
      packageName,
      notes 
    } = body;

    // Validate required fields
    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          details: {
            fullName: !fullName ? 'Required' : null,
            email: !email ? 'Required' : null,
            phone: !phone ? 'Required' : null,
          }
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Insert application
    const { data, error } = await supabase
      .from('applications')
      .insert({
        full_name: fullName,
        email: email,
        phone: phone,
        country_id: countryId || null,
        country_name: countryName || null,
        package_id: packageId || null,
        package_name: packageName || null,
        notes: notes || null,
        status: 'new',
        source: 'mobile_app',
      })
      .select('id')
      .single();

    if (error) {
      console.error('API: submitApplication error', error);
      return NextResponse.json(
        { success: false, error: 'Failed to submit application' },
        { status: 500 }
      );
    }

    // Send email notification (non-blocking)
    try {
      const notificationPayload = {
        full_name: fullName,
        email: email,
        phone: phone,
        country_name: countryName,
        package_name: packageName,
        notes: notes,
      };

      // Use absolute URL for server-side fetch
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kolayseyahat.net';
      
      fetch(`${baseUrl}/api/send-application-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationPayload),
      }).catch(err => console.error('Email notification failed:', err));
    } catch (err) {
      console.error('Email notification error:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Başvurunuz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.',
      applicationId: data?.id,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('API: application error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
