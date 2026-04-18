#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║           🔬 Quick AI Service Test 🔬                        ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if dev server is running
echo "🔍 Checking if dev server is running..."
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Dev server is not running!"
    echo ""
    echo "Please start it first:"
    echo "  npm run dev"
    echo ""
    exit 1
fi
echo "✅ Dev server is running"
echo ""

# Test the Predict API
echo "🔮 Testing Predict API..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{
    "facilityId": "test-gate-1",
    "type": "gate",
    "currentWait": 10
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Predict API: WORKING (HTTP $HTTP_CODE)"
    echo ""
    echo "Response:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    
    # Extract key info
    ENGINE=$(echo "$BODY" | grep -o '"engine":"[^"]*"' | cut -d'"' -f4)
    PREDICTED=$(echo "$BODY" | grep -o '"predictedWait":[0-9]*' | cut -d':' -f2)
    CONFIDENCE=$(echo "$BODY" | grep -o '"confidence":"[^"]*"' | cut -d'"' -f4)
    
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                        SUMMARY                               ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo "Engine:          $ENGINE"
    echo "Predicted Wait:  $PREDICTED minutes"
    echo "Confidence:      $CONFIDENCE"
    echo ""
    
    if [ "$ENGINE" = "vertex-ai" ]; then
        echo "🎉 Full AI mode active! Vertex AI is working."
    elif [ "$ENGINE" = "surrogate" ]; then
        echo "⚠️  Surrogate mode: Using rule-based predictions."
        echo "   (This is normal if Vertex AI is not configured)"
    elif [ "$ENGINE" = "fallback" ]; then
        echo "⚠️  Fallback mode: Using baseline estimates."
        echo "   (AI services may be temporarily unavailable)"
    fi
    
    echo ""
    echo "✅ Your app is working correctly!"
    
else
    echo "❌ Predict API: FAILED (HTTP $HTTP_CODE)"
    echo ""
    echo "Response:"
    echo "$BODY"
    echo ""
    echo "❌ There's an issue with the Predict API."
    echo "   Check the server logs for more details."
    exit 1
fi
