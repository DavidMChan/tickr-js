#!/bin/bash
set -e

# Define directories
ROOT_DIR=$(pwd)
TEMP_DIR=$(mktemp -d)
PACK_NAME=$(npm pack)

echo "📦 Package created: $PACK_NAME"
echo "🛠️  Setting up temporary test environment at $TEMP_DIR"

# Move pack to temp dir
mv $PACK_NAME $TEMP_DIR/

# Setup temp project
cd $TEMP_DIR
npm init -y
npm install ./$PACK_NAME
npm install ts-node typescript dotenv @types/node

# Copy test file and adjust import
echo "📝 Copying test file..."
cp $ROOT_DIR/test.ts ./test.ts

# Replace local import with package import
# 'import { TickrClient } from './src';' -> 'import { TickrClient } from 'tickr-js';'
sed -i '' "s|from './src'|from 'tickr-js'|g" test.ts

# Set environment variables if not present (pass through from parent shell)
# User should have TICKR_API_KEY set in their environment or .env file in root
if [ -f "$ROOT_DIR/.env" ]; then
  echo "env file found, copying to temp dir"
  cp "$ROOT_DIR/.env" .
fi

echo "🚀 Running E2E test..."
npx ts-node -r dotenv/config test.ts

# Cleanup
echo "🧹 Cleaning up..."
cd $ROOT_DIR
rm -rf $TEMP_DIR

echo "✅ E2E Test Passed!"
