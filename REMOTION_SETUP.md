# Remotion Video Rendering Setup

Bu döküman, Remotion ile video render etmek için gerekli kurulum adımlarını içerir.

## 🚀 Hızlı Başlangıç

### 1. Yerel Rendering (Development)

Yerel makinenizde video render etmek için:

```bash
# Bağımlılıklar zaten yüklü
npm install
```

Video render API endpoint'i kullanıma hazır:
- **Endpoint:** `POST /api/admin/ai/remotion-render`
- **Kullanım:** Video script sayfasından "Video Oluştur" butonuna tıklayın

### 2. Cloud Rendering (Production) - Remotion Lambda

Production ortamında hızlı ve ölçeklenebilir rendering için AWS Lambda kullanın.

## 📋 AWS Lambda Kurulumu

### Adım 1: AWS Hesabı ve Credentials

```bash
# AWS CLI'yi kurun (eğer yoksa)
brew install awscli  # macOS
# veya
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# AWS credentials'ı yapılandırın
aws configure
```

Gerekli bilgiler:
- **AWS Access Key ID:** IAM kullanıcısından alın
- **AWS Secret Access Key:** IAM kullanıcısından alın
- **Default region:** `us-east-1` (önerilen)
- **Default output format:** `json`

### Adım 2: IAM Permissions

AWS IAM'de aşağıdaki izinlere sahip bir kullanıcı oluşturun:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:*",
        "s3:*",
        "iam:*",
        "cloudformation:*",
        "logs:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### Adım 3: Remotion Lambda Deploy

```bash
# Remotion Lambda'yı deploy edin
npx remotion lambda sites create src/remotion/Root.tsx --site-name=kolay-seyahat-video

# Function'ı deploy edin
npx remotion lambda functions deploy --memory=2048 --timeout=900
```

### Adım 4: Environment Variables

`.env.local` dosyanıza ekleyin:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# Remotion Lambda
REMOTION_LAMBDA_FUNCTION_NAME=remotion-render-4-0-0
REMOTION_SERVE_URL=https://your-site-url.s3.amazonaws.com
REMOTION_LAMBDA_REGION=us-east-1

# S3 Bucket (Remotion tarafından otomatik oluşturulur)
REMOTION_S3_BUCKET=remotionlambda-xxxxxx
```

### Adım 5: API Endpoint'i Güncelle

`src/app/api/admin/ai/render-video/route.ts` dosyasında Lambda kullanımını aktif edin.

## 🎬 Kullanım

### Yerel Rendering

```typescript
// Otomatik olarak çalışır
// Video script sayfasından "Video Oluştur" butonuna tıklayın
```

### Lambda Rendering

```typescript
import { renderMediaOnLambda } from '@remotion/lambda/client';

const { renderId, bucketName } = await renderMediaOnLambda({
  region: process.env.AWS_REGION!,
  functionName: process.env.REMOTION_LAMBDA_FUNCTION_NAME!,
  serveUrl: process.env.REMOTION_SERVE_URL!,
  composition: 'VideoComposition',
  inputProps: {
    title: 'Video Title',
    scenes: [...],
  },
  codec: 'h264',
  imageFormat: 'jpeg',
});
```

## 💰 Maliyet Tahmini

### AWS Lambda Pricing (us-east-1)

- **Lambda Execution:** $0.0000166667 per GB-second
- **S3 Storage:** $0.023 per GB/month
- **Data Transfer:** İlk 100 GB ücretsiz

**Örnek Video (4 dakika, 6 sahne):**
- Render süresi: ~2 dakika
- Lambda maliyet: ~$0.05
- S3 storage: ~$0.001/ay
- **Toplam:** ~$0.05 per video

### Yerel Rendering

- **Maliyet:** $0 (Ücretsiz)
- **Süre:** 5-10 dakika
- **Kaynak:** Yerel CPU/RAM

## 🔧 Troubleshooting

### Hata: "AWS credentials not found"

```bash
# Credentials'ı kontrol edin
aws sts get-caller-identity

# Yeniden yapılandırın
aws configure
```

### Hata: "Lambda function not found"

```bash
# Function'ları listeleyin
npx remotion lambda functions ls

# Yeniden deploy edin
npx remotion lambda functions deploy
```

### Hata: "Timeout"

Lambda timeout'u artırın:

```bash
npx remotion lambda functions deploy --timeout=900
```

### Hata: "Out of memory"

Lambda memory'yi artırın:

```bash
npx remotion lambda functions deploy --memory=3008
```

## 📊 Monitoring

### CloudWatch Logs

```bash
# Lambda logs'ları görüntüleyin
aws logs tail /aws/lambda/remotion-render-4-0-0 --follow
```

### Render Status

```typescript
import { getRenderProgress } from '@remotion/lambda/client';

const progress = await getRenderProgress({
  renderId: 'your-render-id',
  bucketName: 'your-bucket',
  functionName: 'remotion-render-4-0-0',
  region: 'us-east-1',
});

console.log(`Progress: ${progress.overallProgress * 100}%`);
```

## 🚀 Production Checklist

- [ ] AWS credentials yapılandırıldı
- [ ] IAM permissions ayarlandı
- [ ] Remotion Lambda deploy edildi
- [ ] Environment variables eklendi
- [ ] S3 bucket oluşturuldu
- [ ] CloudWatch monitoring aktif
- [ ] Maliyet limitleri ayarlandı
- [ ] Backup stratejisi belirlendi

## 📚 Kaynaklar

- [Remotion Lambda Documentation](https://www.remotion.dev/docs/lambda)
- [AWS Lambda Pricing](https://aws.amazon.com/lambda/pricing/)
- [Remotion Discord](https://remotion.dev/discord)
- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)

## 🆘 Destek

Sorun yaşarsanız:

1. [Remotion Discord](https://remotion.dev/discord) - Topluluk desteği
2. [GitHub Issues](https://github.com/remotion-dev/remotion/issues) - Bug raporları
3. [AWS Support](https://aws.amazon.com/support/) - AWS sorunları

## 🎯 Sonraki Adımlar

1. ✅ Yerel rendering'i test edin
2. ✅ AWS hesabı oluşturun
3. ✅ Lambda'yı deploy edin
4. ✅ Production'da test edin
5. ✅ Monitoring kurun
6. ✅ Maliyet optimizasyonu yapın
