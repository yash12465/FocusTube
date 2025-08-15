#!/usr/bin/env python3
"""
Run script for the YouTube Transcript AI Flask backend
"""
import os
import sys

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"🚀 Starting YouTube Transcript AI Backend on port {port}")
    print(f"📝 OpenAI API Key: {'✓ Configured' if os.getenv('OPENAI_API_KEY') else '✗ Missing'}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=True,
        use_reloader=False  # Disable reloader to prevent issues in production-like environments
    )