/**
 * Frontend AI API client for FocusTube
 * Handles all AI-powered features including recommendations, summaries, and quizzes
 */

import { Video } from '../types/video';

export interface AIRecommendationRequest {
  query: string;
  subject?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  previousVideos?: string[];
}

export interface AIRecommendationResponse {
  recommendations: string[];
  explanation: string;
  suggestedSearchTerms: string[];
}

export interface AIVideoSummaryResponse {
  summary: string;
  keyPoints: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  suggestedFollowUp: string[];
}

export interface AIQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface AIQuizResponse {
  questions: AIQuizQuestion[];
  topic: string;
}

/**
 * Get AI-powered video recommendations
 */
export async function getAIRecommendations(request: AIRecommendationRequest): Promise<AIRecommendationResponse> {
  const response = await fetch('/api/ai/recommendations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to get AI recommendations: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Generate AI summary for a video
 */
export async function generateVideoSummary(video: Video): Promise<AIVideoSummaryResponse> {
  const response = await fetch('/api/ai/video-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ video }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate video summary: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Generate AI quiz questions for a video
 */
export async function generateQuiz(video: Video, questionCount: number = 5): Promise<AIQuizResponse> {
  const response = await fetch('/api/ai/generate-quiz', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ video, questionCount }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate quiz: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check if content is educational using AI moderation
 */
export async function moderateContent(title: string, description: string): Promise<boolean> {
  const response = await fetch('/api/ai/moderate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description }),
  });

  if (!response.ok) {
    throw new Error(`Failed to moderate content: ${response.statusText}`);
  }

  const result = await response.json();
  return result.isEducational;
}