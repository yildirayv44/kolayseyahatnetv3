import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, phone, country_name, package_name, notes } = body;

    // Email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
            .value { background: white; padding: 10px; border-radius: 5px; border-left: 3px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎉 Yeni Vize Başvurusu!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Kolay Seyahat - Başvuru Bildirimi</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">👤 Ad Soyad</div>
                <div class="value">${full_name}</div>
              </div>
              
              <div class="field">
                <div class="label">📧 E-posta</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              
              <div class="field">
                <div class="label">📱 Telefon</div>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
              </div>
              
              ${country_name ? `
              <div class="field">
                <div class="label">🌍 Ülke</div>
                <div class="value">${country_name}</div>
              </div>
              ` : ''}
              
              ${package_name ? `
              <div class="field">
                <div class="label">📦 Paket</div>
                <div class="value">${package_name}</div>
              </div>
              ` : ''}
              
              ${notes ? `
              <div class="field">
                <div class="label">📝 Notlar</div>
                <div class="value">${notes}</div>
              </div>
              ` : ''}
              
              <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 5px; border: 2px dashed #667eea;">
                <p style="margin: 0; text-align: center;">
                  <strong>⏰ Başvuru Zamanı:</strong> ${new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}
                </p>
              </div>
            </div>
            <div class="footer">
              <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
              <p>Kolay Seyahat © ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
Yeni Vize Başvurusu - Kolay Seyahat

Ad Soyad: ${full_name}
E-posta: ${email}
Telefon: ${phone}
${country_name ? `Ülke: ${country_name}` : ''}
${package_name ? `Paket: ${package_name}` : ''}
${notes ? `Notlar: ${notes}` : ''}

Başvuru Zamanı: ${new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}
    `;

    // Send email using Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      // Don't fail the request if email fails
      return NextResponse.json({ success: true, emailSent: false });
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Kolay Seyahat <onboarding@resend.dev>', // Update with your verified domain
        to: ['yildirayv4@gmail.com'],
        subject: `🎉 Yeni Vize Başvurusu - ${full_name}`,
        html: emailHtml,
        text: emailText,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error('Resend API error:', error);
      return NextResponse.json({ success: true, emailSent: false });
    }

    const result = await resendResponse.json();
    console.log('Email sent successfully:', result);

    return NextResponse.json({ success: true, emailSent: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    // Don't fail the request if email fails
    return NextResponse.json({ success: true, emailSent: false });
  }
}
