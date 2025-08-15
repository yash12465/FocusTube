# FocusTube - AI-Powered Educational Video Platform

## Overview

FocusTube is a cutting-edge, distraction-free educational video platform that combines curated YouTube content with advanced AI capabilities. The platform provides quality educational videos from trusted channels while eliminating typical distractions like recommendations, comments, or trending sections. Enhanced with OpenRouter API and Mistral AI integration, FocusTube now offers intelligent search, personalized recommendations, AI-generated summaries, and interactive quizzes.

The platform features a comprehensive study management system with bookmarks, notes, tasks, flashcards, study timers, and scheduling capabilities, all enhanced by AI to help users maintain focus and accelerate their learning progress.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Tailwind CSS with Radix UI components for consistent, accessible design
- **Component Library**: shadcn/ui providing pre-built, customizable components
- **State Management**: TanStack Query for server state management and caching
- **Styling**: CSS custom properties for theming with light/dark mode support

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless configuration
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for server bundling

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon serverless platform
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Database Structure**: 
  - Users table for authentication
  - Bookmarks for saved videos
  - Study sessions for time tracking
  - Notes for educational content
  - Tasks for todo management
  - Flashcards for spaced repetition learning
  - Goals and schedules for study planning

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store
- **Storage**: connect-pg-simple for persistent session storage
- **Security**: Session-based authentication without external auth providers

### External Service Integrations
- **YouTube Data API**: For fetching educational video content and metadata
- **OpenRouter API**: AI-powered search and content analysis using Mistral AI model
- **Content Filtering**: AI-enhanced whitelist-based approach using trusted educational channels
- **Video Search**: AI-powered intelligent search with natural language processing

### AI-Powered Features

#### Core AI Functionality
- **Smart Search**: Natural language query processing with intelligent video recommendations
- **Enhanced Video Summaries**: Comprehensive 300+ word summaries with detailed key points, prerequisites, real-world applications, and follow-up topics
- **Advanced Quiz Generation**: 10-question concept-focused quizzes with multiple question types (conceptual, application, analysis, synthesis) and difficulty levels
- **Content Moderation**: AI-powered filtering to ensure educational quality and appropriateness
- **Personalized Recommendations**: Context-aware suggestions based on user level and subject preferences

#### Advanced Learning Features
- **Searchable Video Transcripts**: AI-powered voice-to-text conversion with intelligent search within video content
- **Learning Analytics**: AI-driven progress tracking with performance insights, learning velocity analysis, and predictive recommendations
- **Personalized Learning Paths**: Adaptive study sequences based on user performance, goals, and learning patterns
- **Smart Study Scheduling**: AI-optimized study plans with spaced repetition and optimal timing recommendations
- **Real-time Feedback System**: Instant AI-driven feedback on quizzes and learning activities

#### Future AI Enhancements (In Development)
- **AI Learning Assistant Chatbot**: Conversational AI for real-time questions and explanations
- **Intelligent Study Group Matching**: AI-powered peer matching based on learning compatibility
- **Adaptive Learning Games**: Gamified experiences with real-time difficulty adjustment
- **Voice-to-Text Study Notes**: AI-organized note-taking from speech input
- **Multilingual Support**: Dynamic captioning and content translation

### Key Architectural Decisions

**Monorepo Structure**: The application uses a shared folder structure with client, server, and shared directories for type sharing and code reuse.

**Type Safety**: Full TypeScript implementation across frontend and backend with shared types and Zod validation schemas.

**Educational Content Curation**: Pre-approved channel whitelist ensures only quality educational content is displayed, avoiding the distraction of general YouTube content.

**Distraction-Free Design**: Intentional removal of typical social media features like comments, recommendations, and autoplay to maintain focus on learning.

**Study Management Integration**: Comprehensive study tools built into the platform rather than relying on external services, providing a unified learning experience.

**Progressive Enhancement**: Mobile-responsive design with graceful degradation for various screen sizes and devices.

## External Dependencies

### Core Technologies
- React ecosystem (React, React DOM, React Query)
- Express.js web framework
- Drizzle ORM with PostgreSQL driver
- Neon serverless PostgreSQL database
- YouTube Data API v3

### UI and Styling
- Tailwind CSS for utility-first styling
- Radix UI primitives for accessible components
- Lucide React for consistent iconography
- PostCSS for CSS processing

### Development Tools
- Vite for frontend development and building
- TypeScript for type safety
- ESBuild for server bundling
- tsx for TypeScript execution
- Replit integration for development environment

### Utility Libraries
- Wouter for lightweight routing
- date-fns for date manipulation
- clsx and tailwind-merge for conditional styling
- Zod for runtime type validation
- class-variance-authority for component variants

### Session and Authentication
- express-session for session management
- connect-pg-simple for PostgreSQL session storage
- WebSocket support for Neon database connections