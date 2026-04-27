#!/bin/bash

# Deployment Helper Script for Homeless Aid Platform
# This script helps you deploy to Vercel and Render

echo "🚀 Homeless Aid Platform - Deployment Helper"
echo "=============================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found"
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "⚠️  Render CLI not found (optional)"
    echo "💡 Install with: npm install -g render"
fi

echo ""
echo "Choose deployment option:"
echo "1. Deploy Frontend to Vercel"
echo "2. Deploy Backend to Render (requires Render CLI)"
echo "3. Deploy Both"
echo "4. Setup Environment Variables"
echo "5. Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📱 Deploying Frontend to Vercel..."
        cd frontend
        vercel --prod
        cd ..
        echo "✅ Frontend deployment complete!"
        ;;
    2)
        echo ""
        echo "🔧 Deploying Backend to Render..."
        if command -v render &> /dev/null; then
            cd backend
            render deploy
            cd ..
            echo "✅ Backend deployment complete!"
        else
            echo "❌ Render CLI not installed"
            echo "💡 Please deploy manually via Render dashboard"
            echo "📖 See DEPLOYMENT_GUIDE.md for instructions"
        fi
        ;;
    3)
        echo ""
        echo "🚀 Deploying Both Frontend and Backend..."
        
        # Deploy backend first
        echo "1/2: Deploying Backend..."
        if command -v render &> /dev/null; then
            cd backend
            render deploy
            cd ..
        else
            echo "⚠️  Render CLI not found - skipping backend"
        fi
        
        # Deploy frontend
        echo "2/2: Deploying Frontend..."
        cd frontend
        vercel --prod
        cd ..
        
        echo "✅ Deployment complete!"
        ;;
    4)
        echo ""
        echo "⚙️  Environment Variables Setup"
        echo ""
        echo "Backend Environment Variables (Render):"
        echo "  NODE_ENV=production"
        echo "  PORT=5000"
        echo "  DATABASE_URL=<your-postgres-url>"
        echo "  JWT_SECRET=<generate-secure-string>"
        echo "  MONGODB_URI=<your-mongodb-uri>"
        echo "  FRONTEND_URL=<your-vercel-url>"
        echo ""
        echo "Frontend Environment Variables (Vercel):"
        echo "  NEXT_PUBLIC_API_URL=<your-render-backend-url>"
        echo ""
        echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo "🎉 Happy deploying!"
