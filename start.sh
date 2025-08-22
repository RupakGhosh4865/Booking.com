#!/bin/bash

echo "🚀 Starting Appointment Booking System..."

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

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend development server..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Both servers are starting..."
echo "📱 Frontend: http://localhost:5173"
echo "🔌 Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait $BACKEND_PID $FRONTEND_PID
