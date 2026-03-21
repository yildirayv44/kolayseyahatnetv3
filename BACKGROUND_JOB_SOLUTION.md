# Background Job Çözümü

## Sorun
- Batch scraping 20+ dakika sürüyor
- HTTP request timeout oluyor
- Sayfa kapanınca işlem duruyor

## Çözüm 1: Vercel Cron + Queue System (Önerilen)

### Adımlar:

1. **Queue Tablosu Oluştur**
```sql
CREATE TABLE scraping_queue (
  id SERIAL PRIMARY KEY,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_countries INT,
  processed_countries INT DEFAULT 0,
  failed_countries INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. **Manuel Trigger API**
```typescript
// /api/admin/visa-matrix/trigger-batch
export async function POST() {
  // Queue'ya job ekle
  const { data } = await supabase
    .from('scraping_queue')
    .insert({ status: 'pending' })
    .select()
    .single();
  
  return NextResponse.json({ 
    jobId: data.id,
    message: 'Batch scraping queued' 
  });
}
```

3. **Cron Worker**
```typescript
// /api/cron/process-scraping-queue
export async function GET() {
  // Pending job'ları al
  const { data: jobs } = await supabase
    .from('scraping_queue')
    .select('*')
    .eq('status', 'pending')
    .limit(1);
  
  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ message: 'No pending jobs' });
  }
  
  const job = jobs[0];
  
  // Job'u processing olarak işaretle
  await supabase
    .from('scraping_queue')
    .update({ status: 'processing', started_at: new Date() })
    .eq('id', job.id);
  
  // Her seferinde 1 ülke işle (10 saniye içinde biter)
  // Sonra cron tekrar çalışır, bir sonraki ülkeyi işler
  
  return NextResponse.json({ success: true });
}
```

4. **vercel.json**
```json
{
  "crons": [
    {
      "path": "/api/cron/process-scraping-queue",
      "schedule": "* * * * *"  // Her dakika çalış
    }
  ]
}
```

### Avantajlar:
- ✅ Sayfa kapansa da devam eder
- ✅ İnternet kesilse de devam eder
- ✅ Her cron run 10 saniye içinde biter
- ✅ Progress tracking
- ✅ Hata yönetimi

---

## Çözüm 2: Upstash QStash (Daha Gelişmiş)

### Kurulum:
```bash
npm install @upstash/qstash
```

### Kullanım:
```typescript
import { Client } from "@upstash/qstash";

const qstash = new Client({ token: process.env.QSTASH_TOKEN });

// Job'u queue'ya ekle
await qstash.publishJSON({
  url: "https://yoursite.com/api/admin/visa-matrix/process-country",
  body: { countryCode: "TUR" },
  retries: 3,
  delay: 5 // 5 saniye sonra çalış
});
```

### Avantajlar:
- ✅ Daha robust
- ✅ Retry mekanizması
- ✅ Delay/scheduling
- ✅ Dead letter queue

---

## Çözüm 3: Chunk Processing (Basit Geçici Çözüm)

Her seferinde 10 ülke işle, kullanıcı manuel olarak tekrar tıklasın:

```typescript
// İlk 10 ülkeyi işle
const chunk = sourceCountries.slice(0, 10);

// Kalan ülke sayısını döndür
return NextResponse.json({
  processed: 10,
  remaining: sourceCountries.length - 10,
  message: 'İlk 10 ülke tamamlandı, devam etmek için tekrar tıklayın'
});
```

---

## Öneri

**Kısa vadede:** Çözüm 3 (Chunk processing)
**Uzun vadede:** Çözüm 1 (Cron + Queue)

Hangisini tercih edersiniz?
