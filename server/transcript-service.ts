import { spawn } from 'child_process';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TranscriptSummary {
  main_points: string[];
  key_concepts: string[];
  prerequisites: string[];
  applications: string[];
  detailed_explanation: string;
  follow_up_topics: string[];
}

interface TranscriptQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: string;
  type: string;
}

interface ProcessedVideo {
  video_id: string;
  transcript: string;
  summary: TranscriptSummary;
  questions: TranscriptQuestion[];
  transcript_length: number;
}

export function extractVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  if (url.length === 11 && /^[a-zA-Z0-9_-]+$/.test(url)) {
    return url;
  }
  
  throw new Error('Invalid YouTube URL or video ID');
}

export function getTranscript(videoId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Use Python subprocess to get transcript
    const pythonScript = `
import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi
import re

try:
    video_id = sys.argv[1]
    transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
    
    # Combine all transcript text
    full_transcript = ' '.join([entry['text'] for entry in transcript_list])
    
    # Clean up the transcript
    full_transcript = re.sub(r'\\[.*?\\]', '', full_transcript)  # Remove annotations
    full_transcript = re.sub(r'\\s+', ' ', full_transcript)  # Normalize whitespace
    
    print(full_transcript.strip())
    
except Exception as e:
    # Try to get auto-generated transcript if manual one fails
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
        full_transcript = ' '.join([entry['text'] for entry in transcript_list])
        full_transcript = re.sub(r'\\[.*?\\]', '', full_transcript)
        full_transcript = re.sub(r'\\s+', ' ', full_transcript)
        print(full_transcript.strip())
    except Exception as e2:
        print(f"ERROR: Could not fetch transcript: {str(e2)}", file=sys.stderr)
        sys.exit(1)
`;

    const python = spawn('python', ['-c', pythonScript, videoId]);
    let transcript = '';
    let error = '';

    python.stdout.on('data', (data) => {
      transcript += data.toString();
    });

    python.stderr.on('data', (data) => {
      error += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0 && transcript.trim()) {
        resolve(transcript.trim());
      } else {
        reject(new Error(error || 'Failed to fetch transcript'));
      }
    });
  });
}

export async function generateSummaryAndQuestions(
  transcript: string, 
  videoTitle: string = ""
): Promise<{ summary: TranscriptSummary; questions: TranscriptQuestion[] }> {
  
  const prompt = `
  Analyze the following YouTube video transcript and provide:

  1. COMPREHENSIVE SUMMARY (300+ words):
  - Key learning objectives and main concepts
  - Prerequisites or background knowledge needed
  - Step-by-step breakdown of important processes
  - Real-world applications and examples
  - Key insights and takeaways
  - Follow-up topics for further learning

  2. CONCEPTUAL QUESTIONS (10 questions):
  Create 10 multiple-choice questions covering different cognitive levels:
  - 3 Conceptual questions (understanding definitions and basic concepts)
  - 3 Application questions (applying knowledge to new situations)  
  - 2 Analysis questions (breaking down complex ideas)
  - 2 Synthesis questions (combining concepts creatively)

  Each question should have:
  - Clear question text
  - 4 multiple choice options (A, B, C, D)
  - Correct answer indicated
  - Brief explanation of why the answer is correct
  - Difficulty level (Beginner/Intermediate/Advanced)
  - Question type (conceptual/application/analysis/synthesis)

  Video Title: ${videoTitle}
  
  Transcript:
  ${transcript}

  Please format your response as valid JSON with this structure:
  {
      "summary": {
          "main_points": ["point1", "point2", ...],
          "key_concepts": ["concept1", "concept2", ...],
          "prerequisites": ["prereq1", "prereq2", ...],
          "applications": ["app1", "app2", ...],
          "detailed_explanation": "detailed 300+ word explanation",
          "follow_up_topics": ["topic1", "topic2", ...]
      },
      "questions": [
          {
              "question": "Question text",
              "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
              "correct_answer": 0,
              "explanation": "Why this answer is correct",
              "difficulty": "Beginner/Intermediate/Advanced",
              "type": "conceptual/application/analysis/synthesis"
          }
      ]
  }
  `;

  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          "role": "system", 
          "content": "You are an expert educational content creator. Provide comprehensive, accurate educational content based on video transcripts. Always respond with valid JSON."
        },
        {"role": "user", "content": prompt}
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
      temperature: 0.7
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }
    
    const result = JSON.parse(content);
    return result;
    
  } catch (error) {
    throw new Error(`Error generating content with AI: ${error}`);
  }
}

export async function answerQuestionAboutTranscript(
  question: string, 
  transcript: string, 
  videoTitle: string = ""
): Promise<string> {
  
  const prompt = `
  You are an AI tutor helping a student understand a YouTube video. Based on the transcript provided, answer the student's question clearly and comprehensively.

  Video Title: ${videoTitle}
  Student Question: ${question}
  
  Video Transcript:
  ${transcript}

  Please provide:
  1. A direct answer to the question
  2. Relevant context from the video
  3. Additional explanations if needed
  4. Related concepts the student should understand
  
  If the question cannot be answered from the transcript, politely explain that and suggest what information would be needed.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          "role": "system", 
          "content": "You are a helpful AI tutor. Provide clear, educational responses based on video content."
        },
        {"role": "user", "content": prompt}
      ],
      max_tokens: 1000,
      temperature: 0.7
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content received from OpenAI");
    }
    
    return content;
    
  } catch (error) {
    throw new Error(`Error answering question: ${error}`);
  }
}

export function searchTranscript(query: string, transcript: string): any[] {
  const sentences = transcript.split('.');
  const relevantSentences: { text: string; relevance_score: number }[] = [];
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    if (query.toLowerCase().split(' ').some(word => sentence.toLowerCase().includes(word))) {
      // Include context (previous and next sentence)
      const contextStart = Math.max(0, i - 1);
      const contextEnd = Math.min(sentences.length, i + 2);
      const context = sentences.slice(contextStart, contextEnd).join('. ').trim();
      
      relevantSentences.push({
        text: context,
        relevance_score: sentence.toLowerCase().split(query.toLowerCase()).length - 1
      });
    }
  }
  
  // Sort by relevance and return top 5
  return relevantSentences
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, 5);
}