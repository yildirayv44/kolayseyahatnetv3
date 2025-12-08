# 🔧 Migration Talimatları

## application_steps Kolonunu Eklemek İçin

### Yöntem 1: Supabase Dashboard (Önerilen)

1. **Supabase Dashboard'a git:**
   ```
   https://supabase.com/dashboard
   ```

2. **Projenizi seçin**

3. **SQL Editor'e gidin:**
   - Sol menüden "SQL Editor" tıklayın
   - Veya: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

4. **Aşağıdaki SQL'i çalıştırın:**
   ```sql
   -- Add application_steps column to countries table
   ALTER TABLE countries 
   ADD COLUMN IF NOT EXISTS application_steps JSONB;

   COMMENT ON COLUMN countries.application_steps IS 'Vize başvuru adımları (JSONB array)';
   ```

5. **"Run" butonuna tıklayın**

6. **✅ Başarılı mesajı görmelisiniz**

---

### Yöntem 2: Supabase CLI (Alternatif)

```bash
# Supabase CLI kurulu değilse:
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push

# Veya direkt SQL çalıştır:
supabase db execute --file supabase/migrations/add_application_steps.sql
```

---

### Yöntem 3: Admin Panel Migration Sayfası

1. **Admin panele git:**
   ```
   http://localhost:3000/admin/migrate
   ```

2. **"Run Migrations" butonuna tıkla**

3. **✅ Migration otomatik çalışacak**

---

## Doğrulama

Migration başarılı olduktan sonra kontrol edin:

```sql
-- Kolon eklenmiş mi kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'countries' 
AND column_name = 'application_steps';
```

Beklenen sonuç:
```
column_name        | data_type
-------------------+-----------
application_steps  | jsonb
```

---

## Sorun Giderme

### Hata: "column already exists"
✅ Sorun yok! Kolon zaten eklenmiş demektir.

### Hata: "permission denied"
❌ Service role key kullanmanız gerekiyor.
- Supabase Dashboard'dan çalıştırın
- Veya SUPABASE_SERVICE_ROLE_KEY'i kontrol edin

### Hata: "relation countries does not exist"
❌ Countries tablosu yok!
- Önce countries tablosunu oluşturun
- Veya doğru database'e bağlı olduğunuzdan emin olun
