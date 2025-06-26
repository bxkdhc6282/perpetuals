#!/bin/bash

echo "🔄 Updating SDK and CLI..."

# Build SDK first
echo "📦 Building SDK..."
cd sdk
yarn build
if [ $? -ne 0 ]; then
    echo "❌ SDK build failed"
    exit 1
fi
echo "✅ SDK built successfully"

# Update CLI
echo "🔧 Updating CLI..."
cd ../cli
rm -rf node_modules
rm -rf yarn.lock
yarn install
yarn build
chmod +x dist/index.js 
if [ $? -ne 0 ]; then
    echo "❌ CLI build failed"
    exit 1
fi
echo "✅ CLI updated successfully"

echo "🎉 SDK and CLI are now in sync!"
echo "💡 To update global installation, run: yarn global add ." 