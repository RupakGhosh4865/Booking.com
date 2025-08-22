#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "❌ Backend .env file not found. Please create it from backend/env.example"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo "❌ Frontend .env file not found. Please create it from frontend/env.example"
    exit 1
fi

echo "✅ Environment files found"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Build frontend
echo "🔨 Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend built successfully"

echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Render/Railway/Fly.io"
echo "2. Deploy frontend to Vercel/Netlify"
echo "3. Update environment variables in deployment platforms"
echo "4. Test the deployed application"
