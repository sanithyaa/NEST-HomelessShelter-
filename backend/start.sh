#!/bin/bash

echo "=================================="
echo "🚀 Starting Homeless Aid Backend"
echo "=================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
fi

# Check if database exists
if [ ! -f "homeless_aid.db" ]; then
    echo "🗄️  Database not found. It will be created automatically."
    echo "💡 Run 'python seed_data.py' after startup to add sample data"
fi

# Create uploads folder
mkdir -p uploads

echo ""
echo "=================================="
echo "✅ Setup complete!"
echo "=================================="
echo ""
echo "Starting Flask server..."
echo ""

# Start the application
python app.py
