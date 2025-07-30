#!/bin/bash

# Production build script for Render deployment
echo "Starting production build..."

# Clean install production dependencies only
npm ci --only=production --no-audit --no-fund --silent

# Build the frontend
echo "Building frontend..."
npm run build

# Copy built files to dist if needed
if [ -d "dist" ]; then
    echo "Build completed successfully"
else
    echo "Build failed - dist directory not found"
    exit 1
fi

echo "Build process completed" 