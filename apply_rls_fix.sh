#!/bin/bash

# RLS policy fix script - applies the fix directly to Supabase
echo "🔧 Applying RLS policy fix..."

# Read the migration file and apply it
cat supabase/migrations/20260321192127_fix_visa_pages_seo_rls_policy.sql | \
supabase db execute --linked

if [ $? -eq 0 ]; then
    echo "✅ RLS policy fix applied successfully!"
    echo ""
    echo "Test now:"
    echo "http://localhost:3000/admin/ulkeler/27/bilateral-vize"
else
    echo "❌ Failed to apply RLS policy fix"
    exit 1
fi
