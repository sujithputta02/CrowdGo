#!/bin/bash
echo "Clearing TypeScript and IDE caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .tsbuildinfo
echo "✅ Cache cleared"
echo ""
echo "Running verification..."
npm run type-check && echo "✅ Type check passed" || echo "❌ Type check failed"
npm test 2>&1 | grep -E "(Test Suites:|Tests:)"
