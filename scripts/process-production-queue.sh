#!/bin/bash

# Process production scraping queue manually
# Run this until Vercel cron is configured

echo "🚀 Processing production scraping queue..."
echo "Press Ctrl+C to stop"
echo ""

count=0
while true; do
  count=$((count + 1))
  echo "[$count] Processing next country..."
  
  # Call production cron endpoint (works in dev mode)
  response=$(curl -s "https://www.kolayseyahat.net/api/cron/process-scraping-queue")
  
  # Check if unauthorized
  if echo "$response" | grep -q "Unauthorized"; then
    echo "❌ Unauthorized - CRON_SECRET not set in production"
    echo "Please add CRON_SECRET environment variable in Vercel Dashboard"
    exit 1
  fi
  
  # Parse response
  country=$(echo "$response" | jq -r '.country // "Unknown"')
  current=$(echo "$response" | jq -r '.progress.current // 0')
  total=$(echo "$response" | jq -r '.progress.total // 0')
  percentage=$(echo "$response" | jq -r '.progress.percentage // 0')
  
  if [ "$country" != "Unknown" ]; then
    echo "✅ $country ($current/$total) - $percentage%"
  else
    echo "⏸️  No more countries to process"
    break
  fi
  
  # Wait 2 seconds between requests
  sleep 2
done

echo ""
echo "✅ Queue processing completed!"
