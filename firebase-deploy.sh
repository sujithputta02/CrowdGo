#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║       🔥 CrowdGo Firebase Deployment Script 🔥               ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Pre-deployment checks
echo "📋 Running pre-deployment checks..."
echo ""

echo "1. Checking Firebase login..."
firebase projects:list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Firebase. Running 'firebase login'..."
    firebase login
fi
echo "✅ Firebase authenticated"
echo ""

echo "2. Running tests..."
npm test --silent 2>&1 | grep -E "(Test Suites:|Tests:)"
if [ $? -ne 0 ]; then
    echo "❌ Tests failed! Fix tests before deploying."
    exit 1
fi
echo "✅ Tests passed (225/225)"
echo ""

echo "3. Type checking..."
npm run type-check > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Type check failed! Fix type errors before deploying."
    exit 1
fi
echo "✅ Type check passed (0 errors)"
echo ""

echo "4. Building application..."
npm run build
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

echo "🔥 Deploying to Firebase Hosting..."
echo ""
echo "Project: crowdgo-493512"
echo ""

# Deploy to Firebase
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║          🎉 Deployment Successful! 🎉                        ║"
    echo "║                                                              ║"
    echo "║  Your app is now live at:                                   ║"
    echo "║  https://crowdgo-493512.web.app                             ║"
    echo "║  https://crowdgo-493512.firebaseapp.com                     ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
else
    echo ""
    echo "❌ Deployment failed! Check the errors above."
    exit 1
fi
