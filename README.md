# FocusTube - AI-Powered Educational Video Platform

## Overview

FocusTube is a distraction-free educational video platform that combines curated YouTube content with advanced AI capabilities. The platform provides quality educational videos while eliminating typical distractions like recommendations, comments, or trending sections.

## Key Features

- **YouTube Transcript Processing**: Extract and analyze real video transcripts
- **AI-Powered Summaries**: Comprehensive 300+ word summaries with key concepts
- **Interactive Quizzes**: Auto-generated questions from video content
- **Q&A System**: AI-powered question answering based on video transcripts
- **Smart Search**: Search within video transcripts
- **Study Management**: Bookmarks, notes, tasks, flashcards, and study timers
- **Learning Analytics**: Track your progress and learning patterns

## Prerequisites

Before setting up FocusTube, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** database

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd FocusTube
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Install Python Dependencies

The transcript functionality requires Python packages. Install them using:

```bash
pip install -r requirements.txt
```

This will install:
- `youtube-transcript-api` - For fetching video transcripts
- `openai` - For AI-powered features
- `flask` and `flask-cors` - For potential Flask backend services

### 4. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# OpenAI API (for transcript analysis and AI features)
OPENAI_API_KEY=your_openai_api_key

# Optional: OpenRouter API (for alternative AI provider)
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 5. Set Up the Database

Push the database schema:

```bash
npm run db:push
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Production Mode

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

## Troubleshooting

### Transcript Functionality Not Working

If you encounter issues with the transcript feature:

1. **Verify Python Installation**:
   ```bash
   python --version
   ```

2. **Verify youtube-transcript-api Installation**:
   ```bash
   python -c "from youtube_transcript_api import YouTubeTranscriptApi; print('OK')"
   ```

3. **Reinstall Python Dependencies**:
   ```bash
   pip install -r requirements.txt --force-reinstall
   ```

4. **Check Python Path**: Ensure the `python` command is in your system PATH

### Common Issues

- **"youtube-transcript-api not installed"**: Run `pip install -r requirements.txt`
- **"OPENAI_API_KEY not set"**: Add your OpenAI API key to the `.env` file
- **Database connection errors**: Verify your `DATABASE_URL` is correct

## Project Structure

```
FocusTube/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks
│   │   └── types/       # TypeScript types
│   └── index.html       # Entry HTML file
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── transcript-service.ts  # Transcript processing
│   ├── ai-service.ts    # AI features
│   ├── storage.ts       # Database operations
│   └── db.ts            # Database configuration
├── shared/              # Shared types and schemas
├── requirements.txt     # Python dependencies
└── package.json         # Node.js dependencies
```

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS + Radix UI
- TanStack Query for state management

### Backend
- Node.js with Express
- Python integration for transcript extraction
- Drizzle ORM with PostgreSQL
- OpenAI API for AI features

## API Endpoints

### Transcript Processing
- `POST /api/transcript/process-video` - Process video and generate summary/questions
- `POST /api/transcript/ask-question` - Ask questions about video content
- `POST /api/transcript/search` - Search within video transcripts

### Video Management
- `GET /api/videos/search` - Search for educational videos
- `GET /api/videos/trending` - Get trending educational videos

### Study Features
- `GET/POST /api/bookmarks` - Manage video bookmarks
- `GET/POST /api/study-sessions` - Track study sessions
- `GET/POST /api/notes` - Create and manage notes
- `GET/POST /api/tasks` - Manage learning tasks
- `GET/POST /api/flashcards` - Create flashcards for study

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
