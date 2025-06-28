#!/bin/bash

# GPA Tracker Build Verification Script
echo "🔍 Verifying GPA Tracker build..."

# Check if .next directory exists
if [ ! -d ".next" ]; then
    echo "❌ Build directory not found. Run 'npm run build' first."
    exit 1
fi

# Check build size
BUILD_SIZE=$(du -sh .next | cut -f1)
echo "📊 Build size: $BUILD_SIZE"

# Check if key files exist
echo "📋 Checking build files..."

REQUIRED_FILES=(
    ".next/BUILD_ID"
    ".next/build-manifest.json"
    ".next/prerender-manifest.json"
    ".next/routes-manifest.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Check static directory
if [ -d ".next/static" ]; then
    STATIC_FILES=$(find .next/static -type f | wc -l)
    echo "✅ Static files: $STATIC_FILES files found"
else
    echo "❌ Static directory missing"
    exit 1
fi

# Check server directory
if [ -d ".next/server" ]; then
    SERVER_FILES=$(find .next/server -type f | wc -l)
    echo "✅ Server files: $SERVER_FILES files found"
else
    echo "❌ Server directory missing"
    exit 1
fi

echo ""
echo "🎉 Build verification completed successfully!"
echo "📁 Build is ready for deployment"
echo "💡 Next steps:"
echo "   1. Commit and push your changes"
echo "   2. Deploy to your chosen platform"
echo "   3. Set environment variables" 