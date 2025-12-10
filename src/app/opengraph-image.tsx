import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'Kolay Seyahat - Profesyonel Vize Danışmanlığı';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            Kolay Seyahat
          </div>
          <div
            style={{
              fontSize: 40,
              textAlign: 'center',
              opacity: 0.9,
              maxWidth: '900px',
            }}
          >
            Profesyonel Vize Danışmanlığı
          </div>
          <div
            style={{
              fontSize: 30,
              textAlign: 'center',
              opacity: 0.8,
              marginTop: '20px',
            }}
          >
            %98 Onay Oranı • 10,000+ Başarılı Başvuru
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
