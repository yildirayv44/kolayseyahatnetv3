#!/bin/bash

# ============================================================================
# Bilateral Visa Pages Migration Script
# Bu script migration'ı Supabase'e uygular
# ============================================================================

echo "🚀 Bilateral Visa Pages Migration başlatılıyor..."
echo ""

# Migration dosyasını kontrol et
MIGRATION_FILE="supabase/migrations/20260321191640_add_bilateral_visa_pages_columns.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration dosyası bulunamadı: $MIGRATION_FILE"
    exit 1
fi

echo "✅ Migration dosyası bulundu: $MIGRATION_FILE"
echo ""

# Supabase connection string'i kontrol et
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "⚠️  SUPABASE_DB_URL environment variable bulunamadı"
    echo ""
    echo "Lütfen Supabase Dashboard'dan connection string'i alın:"
    echo "1. Supabase Dashboard → Project Settings → Database"
    echo "2. Connection string'i kopyalayın (Connection pooling - Transaction mode)"
    echo "3. Şu komutu çalıştırın:"
    echo ""
    echo "   export SUPABASE_DB_URL='your-connection-string'"
    echo "   ./APPLY_MIGRATION_NOW.sh"
    echo ""
    exit 1
fi

echo "✅ Supabase connection string bulundu"
echo ""

# Migration'ı uygula
echo "📝 Migration uygulanıyor..."
psql "$SUPABASE_DB_URL" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration başarıyla uygulandı!"
    echo ""
    echo "🎉 Bilateral visa pages sistemi hazır!"
    echo ""
    echo "Test için:"
    echo "1. http://localhost:3000/admin/ulkeler/27/bilateral-vize"
    echo "2. Yeni bilateral vize sayfası oluşturun"
    echo ""
else
    echo ""
    echo "❌ Migration uygulanırken hata oluştu"
    echo ""
    echo "Alternatif: Migration'ı manuel olarak Supabase Dashboard'da çalıştırın:"
    echo "1. Supabase Dashboard → SQL Editor"
    echo "2. $MIGRATION_FILE dosyasının içeriğini kopyalayın"
    echo "3. SQL Editor'a yapıştırın ve çalıştırın"
    echo ""
    exit 1
fi
