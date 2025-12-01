# Supabase Storage Kurulumu

## 1. Storage Bucket Oluştur

Supabase Dashboard'a git: https://supabase.com/dashboard

1. **Storage** menüsüne tıkla
2. **"New bucket"** butonuna tıkla
3. Bucket ayarları:
   - **Name:** `uploads`
   - **Public bucket:** ✅ İşaretle (resimlerin herkese açık olması için)
   - **File size limit:** 5 MB
   - **Allowed MIME types:** `image/*`
4. **Create bucket** butonuna tıkla

## 2. Storage Policy Oluştur (Opsiyonel - Daha Güvenli)

Eğer sadece admin kullanıcılarının resim yüklemesini istiyorsan:

1. **Storage** > **Policies** > **uploads** bucket'ına git
2. **New Policy** > **For full customization** seç
3. **INSERT** policy oluştur:
   ```sql
   -- Policy name: Allow authenticated users to upload
   -- Operation: INSERT
   
   auth.role() = 'authenticated'
   ```

4. **SELECT** policy oluştur (herkes görebilsin):
   ```sql
   -- Policy name: Allow public to read
   -- Operation: SELECT
   
   true
   ```

## 3. Test Et

Admin panel'de:
1. Ülke veya Blog düzenle sayfasına git
2. Resim butonuna tıkla
3. Bir resim seç
4. Resim yüklenmeli ve editöre eklenmelidir

## Alternatif: Public Bucket (Daha Basit)

Eğer policy ile uğraşmak istemiyorsan, bucket'ı public yap:
- Storage > uploads > Settings
- **Public bucket** seçeneğini aktif et
- Bu durumda herkes resim yükleyebilir (dikkatli ol!)

## Notlar

- Resimler `content-images/` klasörüne yüklenir
- Her resim benzersiz bir isimle kaydedilir
- Maksimum dosya boyutu: 5MB
- Desteklenen formatlar: JPG, PNG, GIF, WebP, SVG
