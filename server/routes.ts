import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBookmarkSchema, 
  insertStudySessionSchema, 
  insertNoteSchema, 
  insertTaskSchema, 
  insertFlashcardSchema, 
  insertScheduleSchema 
} from "@shared/schema";
import { aiService, AIRecommendationRequest } from "./ai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY || "";
  
  if (!YOUTUBE_API_KEY) {
    console.warn("Warning: YouTube API key not found. Video search will not work.");
  }

  // Educational channels whitelist
  const TRUSTED_CHANNELS = [
    'UC_x5XG1OV2P6uZZ5FSM9Ttw', // Google Developers
    'UCtxCXg-UvSnTKPOzLH4wJaQ', // Khan Academy
    'UCEBb1b_L6zDS3xTUrIALZOw', // MIT OpenCourseWare
    'UC7cs8q-gJRlGwj4A8OmCmXg', // Unacademy
    'UCzvQcsABBjsoaexHiQTbh_A', // Gate Smashers
    'UC8butISFwT-Wl7EV0hUK0BQ', // freeCodeCamp
    'UCWv7vMbMWH4-V0ZXdmDpPBA', // Programming with Mosh
    'UClcE-kVhqyiHCcjYwcpfj9w', // Learncode.academy
  ];

  // Search educational videos
  app.get("/api/videos/search", async (req, res) => {
    try {
      const { q, subject, duration, level, channels } = req.query;
      
      if (!YOUTUBE_API_KEY) {
        return res.status(500).json({ 
          message: "YouTube API key not configured. Please set YOUTUBE_API_KEY environment variable." 
        });
      }

      let searchQuery = q as string || '';
      
      // Add subject-specific keywords
      if (subject) {
        searchQuery += ` ${subject}`;
      }
      
      // Add educational keywords to filter results
      searchQuery += ' tutorial lecture education learning';

      const channelFilter = channels ? `&channelId=${channels}` : '';
      const durationFilter = duration === 'short' ? '&videoDuration=short' : 
                           duration === 'medium' ? '&videoDuration=medium' : 
                           duration === 'long' ? '&videoDuration=long' : '';

      const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(searchQuery)}&key=${YOUTUBE_API_KEY}&maxResults=24&order=relevance&safeSearch=strict&videoEmbeddable=true${channelFilter}${durationFilter}`;

      const response = await fetch(youtubeUrl);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }
      
      const data = await response.json();

      // Get video details for duration
      if (data.items && data.items.length > 0) {
        const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
        
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        // Merge video details with search results
        const videos = data.items.map((item: any) => {
          const details = detailsData.items?.find((d: any) => d.id === item.id.videoId);
          
          return {
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium.url,
            channel: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            duration: details?.contentDetails?.duration || 'PT0M0S',
            viewCount: details?.statistics?.viewCount || '0',
          };
        });

        res.json({ videos });
      } else {
        res.json({ videos: [] });
      }
    } catch (error) {
      console.error('Error searching videos:', error);
      res.status(500).json({ message: "Failed to search videos" });
    }
  });

  // Get trending educational videos
  app.get("/api/videos/trending", async (req, res) => {
    try {
      if (!YOUTUBE_API_KEY) {
        return res.status(500).json({ 
          message: "YouTube API key not configured" 
        });
      }

      // Use a combination of popular educational searches
      const educationalQueries = [
        'mathematics tutorial',
        'science education',
        'programming tutorial',
        'physics lecture',
        'chemistry basics',
        'history lesson'
      ];

      const randomQuery = educationalQueries[Math.floor(Math.random() * educationalQueries.length)];
      const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(randomQuery + ' education')}&key=${YOUTUBE_API_KEY}&maxResults=12&order=viewCount&safeSearch=strict&videoEmbeddable=true`;

      const response = await fetch(youtubeUrl);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
        
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        const videos = data.items.map((item: any) => {
          const details = detailsData.items?.find((d: any) => d.id === item.id.videoId);
          
          return {
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium.url,
            channel: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            duration: details?.contentDetails?.duration || 'PT0M0S',
            viewCount: details?.statistics?.viewCount || '0',
          };
        });

        res.json({ videos });
      } else {
        res.json({ videos: [] });
      }
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      res.status(500).json({ message: "Failed to fetch trending videos" });
    }
  });

  // Bookmarks routes
  app.get("/api/bookmarks", async (req, res) => {
    try {
      const userId = 1; // Using default user for demo
      const bookmarks = await storage.getBookmarks(userId);
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  app.post("/api/bookmarks", async (req, res) => {
    try {
      const userId = 1; // Using default user for demo
      const bookmarkData = insertBookmarkSchema.parse(req.body);
      const bookmark = await storage.addBookmark(userId, bookmarkData);
      res.json(bookmark);
    } catch (error) {
      res.status(400).json({ message: "Invalid bookmark data" });
    }
  });

  app.delete("/api/bookmarks/:videoId", async (req, res) => {
    try {
      const userId = 1; // Using default user for demo
      const { videoId } = req.params;
      await storage.removeBookmark(userId, videoId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove bookmark" });
    }
  });

  app.get("/api/bookmarks/:videoId/status", async (req, res) => {
    try {
      const userId = 1; // Using default user for demo
      const { videoId } = req.params;
      const isBookmarked = await storage.isBookmarked(userId, videoId);
      res.json({ isBookmarked });
    } catch (error) {
      res.status(500).json({ message: "Failed to check bookmark status" });
    }
  });

  // Study session routes
  app.get("/api/study-sessions", async (req, res) => {
    try {
      const userId = 1; // Using default user for demo
      const sessions = await storage.getStudySessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch study sessions" });
    }
  });

  app.post("/api/study-sessions", async (req, res) => {
    try {
      const userId = 1; // Using default user for demo
      const sessionData = insertStudySessionSchema.parse(req.body);
      const session = await storage.addStudySession(userId, sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.get("/api/study-time/total", async (req, res) => {
    try {
      const userId = 1; // Using default user for demo
      const totalTime = await storage.getTotalStudyTime(userId);
      res.json({ totalTime });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch total study time" });
    }
  });

  // Notes routes
  app.get("/api/notes", async (req, res) => {
    try {
      const userId = 1; // Using default user for demo
      const notes = await storage.getNotes(userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const userId = 1;
      const noteData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(userId, noteData);
      res.json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  // Tasks routes  
  app.get("/api/tasks", async (req, res) => {
    try {
      const userId = 1;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const userId = 1;
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(userId, taskData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  // Flashcards routes
  app.get("/api/flashcards", async (req, res) => {
    try {
      const userId = 1;
      const flashcards = await storage.getFlashcards(userId);
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flashcards" });
    }
  });

  app.post("/api/flashcards", async (req, res) => {
    try {
      const userId = 1;
      const flashcardData = insertFlashcardSchema.parse(req.body);
      const flashcard = await storage.createFlashcard(userId, flashcardData);
      res.json(flashcard);
    } catch (error) {
      res.status(400).json({ message: "Invalid flashcard data" });
    }
  });

  // Schedule routes
  app.get("/api/schedules", async (req, res) => {
    try {
      const userId = 1;
      const schedules = await storage.getSchedules(userId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  app.post("/api/schedules", async (req, res) => {
    try {
      const userId = 1;
      const scheduleData = insertScheduleSchema.parse(req.body);
      const schedule = await storage.createSchedule(userId, scheduleData);
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ message: "Invalid schedule data" });
    }
  });

  // AI-powered search and recommendations
  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { query, subject, userLevel, previousVideos } = req.body as AIRecommendationRequest;
      
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      const recommendations = await aiService.getVideoRecommendations({
        query,
        subject,
        userLevel,
        previousVideos
      });

      res.json(recommendations);
    } catch (error) {
      console.error('AI Recommendations Error:', error);
      res.status(500).json({ message: "Failed to get AI recommendations" });
    }
  });

  // AI video summary
  app.post("/api/ai/video-summary", async (req, res) => {
    try {
      const { video } = req.body;
      
      if (!video) {
        return res.status(400).json({ message: "Video data is required" });
      }

      const summary = await aiService.generateVideoSummary(video);
      res.json(summary);
    } catch (error) {
      console.error('AI Summary Error:', error);
      res.status(500).json({ message: "Failed to generate video summary" });
    }
  });

  // AI quiz generation
  app.post("/api/ai/generate-quiz", async (req, res) => {
    try {
      const { video, questionCount = 5 } = req.body;
      
      if (!video) {
        return res.status(400).json({ message: "Video data is required" });
      }

      const quiz = await aiService.generateQuiz(video, questionCount);
      res.json(quiz);
    } catch (error) {
      console.error('AI Quiz Error:', error);
      res.status(500).json({ message: "Failed to generate quiz" });
    }
  });

  // AI content moderation
  app.post("/api/ai/moderate", async (req, res) => {
    try {
      const { title, description } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ message: "Title and description are required" });
      }

      const isEducational = await aiService.moderateContent(title, description);
      res.json({ isEducational });
    } catch (error) {
      console.error('AI Moderation Error:', error);
      res.status(500).json({ message: "Failed to moderate content" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
