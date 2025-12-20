import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, country_name, package_name } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' });
    }

    // User confirmation email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
            .content { padding: 40px 30px; }
            .success-badge { background: #dcfce7; color: #166534; padding: 15px 20px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
            .success-badge span { font-size: 24px; display: block; margin-bottom: 5px; }
            .info-box { background: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .info-box h3 { margin: 0 0 10px 0; color: #1e40af; }
            .steps { margin: 30px 0; }
            .step { display: flex; align-items: flex-start; margin-bottom: 15px; }
            .step-number { background: #2563eb; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
            .step-content { flex: 1; }
            .step-content strong { color: #1e40af; }
            .cta-section { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; }
            .cta-section h3 { color: #0369a1; margin: 0 0 15px 0; }
            .cta-button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 10px 5px; }
            .cta-button:hover { background: #1d4ed8; }
            .cta-button.secondary { background: white; color: #2563eb; border: 2px solid #2563eb; }
            .app-promo { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; }
            .app-promo h3 { margin: 0 0 10px 0; font-size: 20px; }
            .app-promo p { margin: 0 0 20px 0; opacity: 0.9; }
            .app-features { display: flex; justify-content: center; gap: 20px; margin: 20px 0; flex-wrap: wrap; }
            .app-feature { text-align: center; }
            .app-feature span { display: block; font-size: 24px; margin-bottom: 5px; }
            .app-store-btn { display: inline-block; background: black; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
            .app-store-btn:hover { background: #333; }
            .divider { height: 1px; background: #e5e7eb; margin: 30px 0; }
            .contact-info { background: #fefce8; border: 1px solid #fef08a; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .contact-info h4 { margin: 0 0 10px 0; color: #854d0e; }
            .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
            .footer a { color: #2563eb; text-decoration: none; }
            .social-links { margin: 15px 0; }
            .social-links a { display: inline-block; margin: 0 10px; color: #64748b; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✈️ Kolay Seyahat</h1>
              <p>Vize Danışmanlık Hizmetleri</p>
            </div>
            
            <div class="content">
              <div class="success-badge">
                <span>✅</span>
                <strong>Başvurunuz Başarıyla Alındı!</strong>
              </div>
              
              <p>Sayın <strong>${full_name}</strong>,</p>
              
              <p>
                ${country_name ? `<strong>${country_name}</strong> vizesi için` : 'Vize'} başvurunuz tarafımıza ulaşmıştır. 
                En kısa sürede uzman danışmanlarımız sizinle iletişime geçecektir.
              </p>
              
              ${package_name ? `
              <div class="info-box">
                <h3>📦 Seçtiğiniz Paket</h3>
                <p style="margin: 0;"><strong>${package_name}</strong></p>
              </div>
              ` : ''}
              
              <div class="steps">
                <h3>📋 Sonraki Adımlar</h3>
                <div class="step">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <strong>Danışman Ataması</strong><br>
                    <span style="color: #64748b;">Başvurunuz için uzman bir danışman atanacak.</span>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <strong>İletişim</strong><br>
                    <span style="color: #64748b;">24 saat içinde danışmanımız sizi arayacak.</span>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <strong>Evrak Hazırlığı</strong><br>
                    <span style="color: #64748b;">Gerekli evraklar konusunda bilgilendirileceksiniz.</span>
                  </div>
                </div>
              </div>
              
              <div class="divider"></div>
              
              <!-- Ücretsiz Vize Ön Değerlendirme -->
              <div class="cta-section">
                <h3>🎯 Ücretsiz Vize Ön Değerlendirme</h3>
                <p style="margin: 0 0 20px 0; color: #475569;">
                  Vize başvurunuzun onaylanma şansını öğrenmek ister misiniz?<br>
                  <strong>Ücretsiz ön değerlendirme formunu</strong> doldurun, uzmanlarımız size detaylı bilgi versin.
                </p>
                <a href="https://www.kolayseyahat.tr/vize-degerlendirme.html" class="cta-button">
                  📝 Ücretsiz Değerlendirme Yap
                </a>
              </div>
              
              <!-- Mobil Uygulama Tanıtımı -->
              <div class="app-promo">
                <h3>📱 Kolay Seyahat Mobil Uygulaması</h3>
                <p>Başvurunuzu cebinizden takip edin, anlık bildirimler alın!</p>
                
                <div class="app-features">
                  <div class="app-feature">
                    <span>🔔</span>
                    Anlık Bildirimler
                  </div>
                  <div class="app-feature">
                    <span>📊</span>
                    Başvuru Takibi
                  </div>
                  <div class="app-feature">
                    <span>💬</span>
                    Canlı Destek
                  </div>
                </div>
                
                <a href="https://apps.apple.com/tr/app/kolay-seyahat/id6756451040" class="app-store-btn">
                  🍎 App Store'dan İndir
                </a>
              </div>
              
              <div class="divider"></div>
              
              <div class="contact-info">
                <h4>📞 Sorularınız mı var?</h4>
                <p style="margin: 0;">
                  Bizi arayabilirsiniz: <a href="tel:02129099971" style="color: #854d0e; font-weight: bold;">0212 909 99 71</a><br>
                  E-posta: <a href="mailto:vize@kolayseyahat.net" style="color: #854d0e;">vize@kolayseyahat.net</a><br>
                  WhatsApp: <a href="https://wa.me/902129099971" style="color: #854d0e;">+90 212 909 99 71</a>
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Kolay Seyahat</strong> - Profesyonel Vize Danışmanlığı</p>
              <p>%98 Onay Oranı | 10.000+ Başarılı Başvuru</p>
              <div class="social-links">
                <a href="https://www.kolayseyahat.net">🌐 Web Sitesi</a>
                <a href="https://www.instagram.com/kolayseyahat">📸 Instagram</a>
              </div>
              <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
                Bu e-posta ${email} adresine gönderilmiştir.<br>
                © ${new Date().getFullYear()} Kolay Seyahat. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
Sayın ${full_name},

Başvurunuz Başarıyla Alındı!

${country_name ? `${country_name} vizesi için` : 'Vize'} başvurunuz tarafımıza ulaşmıştır. En kısa sürede uzman danışmanlarımız sizinle iletişime geçecektir.

${package_name ? `Seçtiğiniz Paket: ${package_name}` : ''}

Sonraki Adımlar:
1. Danışman Ataması - Başvurunuz için uzman bir danışman atanacak.
2. İletişim - 24 saat içinde danışmanımız sizi arayacak.
3. Evrak Hazırlığı - Gerekli evraklar konusunda bilgilendirileceksiniz.

---

🎯 ÜCRETSİZ VİZE ÖN DEĞERLENDİRME
Vize başvurunuzun onaylanma şansını öğrenmek için ücretsiz ön değerlendirme formunu doldurun:
https://www.kolayseyahat.tr/vize-degerlendirme.html

---

📱 MOBİL UYGULAMAMIZI İNDİRİN
Başvurunuzu cebinizden takip edin, anlık bildirimler alın!
App Store: https://apps.apple.com/tr/app/kolay-seyahat/id6756451040

---

Sorularınız için:
Telefon: 0212 909 99 71
E-posta: vize@kolayseyahat.net
WhatsApp: +90 212 909 99 71

Kolay Seyahat - Profesyonel Vize Danışmanlığı
%98 Onay Oranı | 10.000+ Başarılı Başvuru
    `;

    // Send email using Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json({ success: false, error: 'Email service not configured' });
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Kolay Seyahat <onboarding@resend.dev>', // Update with your verified domain
        to: [email],
        subject: `✅ Başvurunuz Alındı - Kolay Seyahat`,
        html: emailHtml,
        text: emailText,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error('Resend API error:', error);
      return NextResponse.json({ success: false, error: 'Failed to send email' });
    }

    const result = await resendResponse.json();
    console.log('User confirmation email sent successfully:', result);

    return NextResponse.json({ success: true, emailSent: true });
  } catch (error) {
    console.error('Error sending user confirmation:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' });
  }
}
