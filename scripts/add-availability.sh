#!/bin/bash

# Add test availability for booking testing
# This creates availability slots for the next 30 days

LAWYER_ID="n07jUGK7JblxZEGJTYmR"

echo "Adding test availability for lawyer $LAWYER_ID..."

# Get today's date
TODAY=$(date +%Y-%m-%d)

# Loop through next 30 days and add slots via Firestore REST API
for i in {1..30}; do
  DATE=$(date -v+${i}d +%Y-%m-%d 2>/dev/null || date -d "+${i} days" +%Y-%m-%d)
  
  for TIME in "09:00" "11:00" "13:00"; do
    firebase firestore:set "lawyers/$LAWYER_ID/availability/$(uuidgen)" \
      --data="{\"date\":\"$DATE\",\"time\":\"$TIME\",\"isAvailable\":true,\"bookedBy\":null}" \
      --project pocketlawyer-2582e
  done
  
  echo "✓ Added slots for $DATE"
done

echo "✅ Done! Added 90 availability slots (30 days × 3 slots/day)"
