// Video type is defined in client/src/types/video.ts
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

export interface AIRecommendationRequest {
  query: string;
  subject?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  previousVideos?: string[]; // Video IDs user has watched
}

export interface AIRecommendationResponse {
  recommendations: string[]; // Educational topics/keywords for video search
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
 * AI Service class for handling OpenRouter API interactions
 * Provides educational content recommendations, summaries, and quiz generation
 */
export class AIService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private model = 'mistralai/mistral-small-3.2-24b-instruct:free';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY!;
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }
  }

  /**
   * Make a request to OpenRouter API with proper error handling
   */
  private async makeRequest(messages: any[]): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://focustube.replit.app', // Your site URL
          'X-Title': 'FocusTube - Educational Video Platform', // Your site name
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error(`Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get AI-powered video recommendations based on user query
   */
  async getVideoRecommendations(request: AIRecommendationRequest): Promise<AIRecommendationResponse> {
    const prompt = `
You are an educational content curator for FocusTube, a distraction-free learning platform. 
Generate educational video search recommendations for this query: "${request.query}"

Context:
- Subject: ${request.subject || 'General'}
- User Level: ${request.userLevel || 'intermediate'}
- Previously watched: ${request.previousVideos?.length || 0} videos

Please provide:
1. 3-5 specific educational search terms that would find high-quality educational videos
2. A brief explanation of why these topics are relevant
3. 2-3 alternative search terms for broader exploration

Focus on educational content from trusted sources like Khan Academy, Crash Course, MIT OpenCourseWare, etc.

Respond in JSON format:
{
  "recommendations": ["search term 1", "search term 2", "search term 3"],
  "explanation": "Brief explanation of relevance",
  "suggestedSearchTerms": ["alternative 1", "alternative 2"]
}`;

    const response = await this.makeRequest([
      { role: 'user', content: prompt }
    ]);

    try {
      return JSON.parse(response);
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        recommendations: [request.query],
        explanation: 'AI response could not be parsed, using original query',
        suggestedSearchTerms: [`${request.query} tutorial`, `${request.query} explained`]
      };
    }
  }

  /**
   * Generate AI summary for a video based on its metadata
   */
  async generateVideoSummary(video: Video): Promise<AIVideoSummaryResponse> {
    const prompt = `
Analyze this educational video and provide a comprehensive summary:

Title: ${video.title}
Channel: ${video.channel}
Description: ${video.description.substring(0, 500)}...
Duration: ${video.duration}

Please provide:
1. A concise summary (2-3 sentences)
2. 3-5 key learning points
3. Difficulty level assessment
4. 2-3 suggested follow-up topics

Respond in JSON format:
{
  "summary": "Concise video summary",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "difficulty": "beginner|intermediate|advanced",
  "suggestedFollowUp": ["follow-up topic 1", "follow-up topic 2"]
}`;

    const response = await this.makeRequest([
      { role: 'user', content: prompt }
    ]);

    try {
      return JSON.parse(response);
    } catch (error) {
      return {
        summary: `Educational video about ${video.title} by ${video.channel}`,
        keyPoints: ['Key concepts covered in the video'],
        difficulty: 'intermediate' as const,
        suggestedFollowUp: ['Related topics to explore']
      };
    }
  }

  /**
   * Generate quiz questions based on video content
   */
  async generateQuiz(video: Video, questionCount: number = 5): Promise<AIQuizResponse> {
    const prompt = `
Create a ${questionCount}-question educational quiz based on this video:

Title: ${video.title}
Channel: ${video.channel}
Description: ${video.description.substring(0, 500)}...

Generate multiple-choice questions that test understanding of key concepts.
Each question should have 4 options with only one correct answer.

Respond in JSON format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ],
  "topic": "Main topic of the quiz"
}`;

    const response = await this.makeRequest([
      { role: 'user', content: prompt }
    ]);

    try {
      return JSON.parse(response);
    } catch (error) {
      return {
        questions: [{
          question: `What is the main topic of "${video.title}"?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: 'This is a sample question generated as fallback'
        }],
        topic: video.title
      };
    }
  }

  /**
   * Moderate content to ensure it's educational
   */
  async moderateContent(title: string, description: string): Promise<boolean> {
    const prompt = `
Analyze this content to determine if it's educational and appropriate for a learning platform:

Title: ${title}
Description: ${description.substring(0, 300)}...

Is this content:
1. Educational in nature?
2. Appropriate for students?
3. Free from inappropriate material?
4. Focused on learning/teaching?

Respond with only "true" if educational and appropriate, "false" if not.`;

    const response = await this.makeRequest([
      { role: 'user', content: prompt }
    ]);

    return response.toLowerCase().trim().includes('true');
  }
}

// Export singleton instance
export const aiService = new AIService();