#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║          🚀 CrowdGo Deployment Script 🚀                     ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Pre-deployment checks
echo "📋 Running pre-deployment checks..."
echo ""

echo "1. Running tests..."
npm test --silent 2>&1 | grep -E "(Test Suites:|Tests:)"
if [ $? -ne 0 ]; then
    echo "❌ Tests failed! Fix tests before deploying."
    exit 1
fi
echo "✅ Tests passed"
echo ""

echo "2. Type checking..."
npm run type-check > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Type check failed! Fix type errors before deploying."
    exit 1
fi
echo "✅ Type check passed"
echo ""

echo "3. Building application..."
npm run build > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Check build errors."
    exit 1
fi
echo "✅ Build successful"
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║          ✅ All checks passed! Ready to deploy               ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm i -g vercel
fi

echo "🚀 Deploying to Vercel..."
echo ""
echo "Choose deployment type:"
echo "1. Production (--prod)"
echo "2. Preview (default)"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "🌐 Deploying to PRODUCTION..."
    vercel --prod
else
    echo ""
    echo "🔍 Deploying PREVIEW..."
    vercel
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║          🎉 Deployment Complete! 🎉                          ║"
echo "║                                                              ║"
echo "║  Don't forget to set environment variables in Vercel!        ║"
echo "║  Visit: https://vercel.com/dashboard                         ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
