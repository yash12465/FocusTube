export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
}

export interface SearchFilters {
  subject: string;
  duration: 'short' | 'medium' | 'long' | '';
  level: 'beginner' | 'intermediate' | 'advanced' | '';
  channels: string[];
}

export interface StudySession {
  id: number;
  userId: number;
  duration: number;
  date: Date;
}
