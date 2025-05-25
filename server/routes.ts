import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookmarkSchema, insertStudySessionSchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
