import { users, bookmarks, studySessions, type User, type InsertUser, type Bookmark, type InsertBookmark, type StudySession, type InsertStudySession } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Bookmarks
  getBookmarks(userId: number): Promise<Bookmark[]>;
  addBookmark(userId: number, bookmark: InsertBookmark): Promise<Bookmark>;
  removeBookmark(userId: number, videoId: string): Promise<void>;
  isBookmarked(userId: number, videoId: string): Promise<boolean>;
  
  // Study Sessions
  getStudySessions(userId: number): Promise<StudySession[]>;
  addStudySession(userId: number, session: InsertStudySession): Promise<StudySession>;
  getTotalStudyTime(userId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookmarks: Map<number, Bookmark>;
  private studySessions: Map<number, StudySession>;
  private currentUserId: number;
  private currentBookmarkId: number;
  private currentSessionId: number;

  constructor() {
    this.users = new Map();
    this.bookmarks = new Map();
    this.studySessions = new Map();
    this.currentUserId = 1;
    this.currentBookmarkId = 1;
    this.currentSessionId = 1;
    
    // Create a default user for demo purposes
    this.createUser({ username: "demo", password: "demo" });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBookmarks(userId: number): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(
      (bookmark) => bookmark.userId === userId
    );
  }

  async addBookmark(userId: number, bookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.currentBookmarkId++;
    const newBookmark: Bookmark = { 
      ...bookmark, 
      id, 
      userId,
      createdAt: new Date()
    };
    this.bookmarks.set(id, newBookmark);
    return newBookmark;
  }

  async removeBookmark(userId: number, videoId: string): Promise<void> {
    const bookmark = Array.from(this.bookmarks.values()).find(
      (b) => b.userId === userId && b.videoId === videoId
    );
    if (bookmark) {
      this.bookmarks.delete(bookmark.id);
    }
  }

  async isBookmarked(userId: number, videoId: string): Promise<boolean> {
    return Array.from(this.bookmarks.values()).some(
      (bookmark) => bookmark.userId === userId && bookmark.videoId === videoId
    );
  }

  async getStudySessions(userId: number): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(
      (session) => session.userId === userId
    );
  }

  async addStudySession(userId: number, session: InsertStudySession): Promise<StudySession> {
    const id = this.currentSessionId++;
    const newSession: StudySession = { 
      ...session, 
      id, 
      userId,
      date: new Date()
    };
    this.studySessions.set(id, newSession);
    return newSession;
  }

  async getTotalStudyTime(userId: number): Promise<number> {
    const sessions = await this.getStudySessions(userId);
    return sessions.reduce((total, session) => total + session.duration, 0);
  }
}

export const storage = new MemStorage();
