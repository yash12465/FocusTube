#!/bin/bash

# FocusTube Setup Script
# This script automates the setup process for FocusTube

set -e  # Exit on any error

echo "=========================================="
echo "FocusTube Setup Script"
echo "=========================================="
echo ""

# Check Node.js
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ and try again."
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION found"
echo ""

# Check Python
echo "Checking Python installation..."
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Determine python command
PYTHON_CMD="python"
if ! command -v python &> /dev/null; then
    PYTHON_CMD="python3"
fi

PYTHON_VERSION=$($PYTHON_CMD --version)
echo "✅ $PYTHON_VERSION found"
echo ""

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install
echo "✅ Node.js dependencies installed"
echo ""

# Install Python dependencies
echo "Installing Python dependencies..."
$PYTHON_CMD -m pip install -r requirements.txt
echo "✅ Python dependencies installed"
echo ""

# Verify Python packages
echo "Verifying Python package installation..."
if $PYTHON_CMD -c "from youtube_transcript_api import YouTubeTranscriptApi" 2>/dev/null; then
    echo "✅ youtube-transcript-api installed correctly"
else
    echo "⚠️  Warning: youtube-transcript-api might not be installed correctly"
fi
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Please create a .env file with the following variables:"
    echo "  - DATABASE_URL"
    echo "  - YOUTUBE_API_KEY"
    echo "  - OPENAI_API_KEY"
    echo ""
    echo "You can copy .env.example if it exists:"
    echo "  cp .env.example .env"
else
    echo "✅ .env file found"
fi
echo ""

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Configure your .env file with API keys"
echo "2. Set up the database: npm run db:push"
echo "3. Start the development server: npm run dev"
echo ""
