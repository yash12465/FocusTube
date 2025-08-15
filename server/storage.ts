import { 
  users, bookmarks, studySessions, notes, tasks, flashcards, goals, schedules,
  type User, type InsertUser, type Bookmark, type InsertBookmark, 
  type StudySession, type InsertStudySession, type Note, type InsertNote,
  type Task, type InsertTask, type Flashcard, type InsertFlashcard,
  type Goal, type InsertGoal, type Schedule, type InsertSchedule
} from "@shared/schema";

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
  
  // Notes
  getNotes(userId: number): Promise<Note[]>;
  createNote(userId: number, note: InsertNote): Promise<Note>;
  
  // Tasks
  getTasks(userId: number): Promise<Task[]>;
  createTask(userId: number, task: InsertTask): Promise<Task>;
  
  // Flashcards
  getFlashcards(userId: number): Promise<Flashcard[]>;
  createFlashcard(userId: number, flashcard: InsertFlashcard): Promise<Flashcard>;
  
  // Schedules
  getSchedules(userId: number): Promise<Schedule[]>;
  createSchedule(userId: number, schedule: InsertSchedule): Promise<Schedule>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookmarks: Map<number, Bookmark>;
  private studySessions: Map<number, StudySession>;
  private notes: Map<number, Note>;
  private tasks: Map<number, Task>;
  private flashcards: Map<number, Flashcard>;
  private schedules: Map<number, Schedule>;
  private currentUserId: number;
  private currentBookmarkId: number;
  private currentSessionId: number;
  private currentNoteId: number;
  private currentTaskId: number;
  private currentFlashcardId: number;
  private currentScheduleId: number;

  constructor() {
    this.users = new Map();
    this.bookmarks = new Map();
    this.studySessions = new Map();
    this.notes = new Map();
    this.tasks = new Map();
    this.flashcards = new Map();
    this.schedules = new Map();
    this.currentUserId = 1;
    this.currentBookmarkId = 1;
    this.currentSessionId = 1;
    this.currentNoteId = 1;
    this.currentTaskId = 1;
    this.currentFlashcardId = 1;
    this.currentScheduleId = 1;
    
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
      subject: session.subject || null,
      date: new Date()
    };
    this.studySessions.set(id, newSession);
    return newSession;
  }

  async getTotalStudyTime(userId: number): Promise<number> {
    const sessions = await this.getStudySessions(userId);
    return sessions.reduce((total, session) => total + session.duration, 0);
  }

  // Notes methods
  async getNotes(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.userId === userId,
    );
  }

  async createNote(userId: number, insertNote: InsertNote): Promise<Note> {
    const id = this.currentNoteId++;
    const note: Note = { 
      ...insertNote, 
      id, 
      userId,
      subject: insertNote.subject || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.notes.set(id, note);
    return note;
  }

  // Tasks methods
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId,
    );
  }

  async createTask(userId: number, insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { 
      ...insertTask, 
      id, 
      userId,
      status: insertTask.status || "pending",
      subject: insertTask.subject || null,
      description: insertTask.description || null,
      priority: insertTask.priority || "medium",
      dueDate: insertTask.dueDate || null,
      createdAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }

  // Flashcards methods
  async getFlashcards(userId: number): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values()).filter(
      (flashcard) => flashcard.userId === userId,
    );
  }

  async createFlashcard(userId: number, insertFlashcard: InsertFlashcard): Promise<Flashcard> {
    const id = this.currentFlashcardId++;
    const flashcard: Flashcard = { 
      ...insertFlashcard, 
      id, 
      userId,
      createdAt: new Date()
    };
    this.flashcards.set(id, flashcard);
    return flashcard;
  }

  // Schedules methods
  async getSchedules(userId: number): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).filter(
      (schedule) => schedule.userId === userId,
    );
  }

  async createSchedule(userId: number, insertSchedule: InsertSchedule): Promise<Schedule> {
    const id = this.currentScheduleId++;
    const schedule: Schedule = { 
      ...insertSchedule, 
      id, 
      userId,
      createdAt: new Date()
    };
    this.schedules.set(id, schedule);
    return schedule;
  }
}

export const storage = new MemStorage();
