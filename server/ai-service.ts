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
  prerequisites?: string[];
  realWorldApplications?: string[];
}

export interface AIQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  questionType?: 'conceptual' | 'application' | 'analysis' | 'synthesis';
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface AIQuizResponse {
  questions: AIQuizQuestion[];
  topic: string;
  learningObjectives?: string[];
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
As an educational content expert, analyze this video and create a comprehensive, detailed summary for students:

Title: ${video.title}
Channel: ${video.channel}
Description: ${video.description.substring(0, 800)}...
Duration: ${video.duration}

Create a DETAILED and COMPREHENSIVE summary that includes:
1. A thorough 4-6 paragraph summary explaining what the video covers, key concepts introduced, and learning objectives (minimum 300 words)
2. 8-12 specific key learning points with detailed explanations
3. Difficulty level assessment with reasoning
4. 5-7 suggested follow-up topics for deeper learning
5. Prerequisites students should know before watching
6. Real-world applications of the concepts taught

Make the summary educational, comprehensive, and helpful for students who want to understand the material deeply. Write as if you're creating study notes that could help someone learn without watching the video.

Respond in JSON format:
{
  "summary": "Detailed 4-6 paragraph comprehensive summary (minimum 300 words)",
  "keyPoints": ["detailed point 1 with explanation", "detailed point 2 with explanation", "detailed point 3 with explanation", "detailed point 4 with explanation", "detailed point 5 with explanation", "detailed point 6 with explanation", "detailed point 7 with explanation", "detailed point 8 with explanation"],
  "difficulty": "beginner|intermediate|advanced",
  "suggestedFollowUp": ["follow-up topic 1", "follow-up topic 2", "follow-up topic 3", "follow-up topic 4", "follow-up topic 5"],
  "prerequisites": ["prerequisite 1", "prerequisite 2", "prerequisite 3"],
  "realWorldApplications": ["application 1", "application 2", "application 3"]
}`;

    const response = await this.makeRequest([
      { role: 'user', content: prompt }
    ]);

    try {
      return JSON.parse(response);
    } catch (error) {
      return {
        summary: `This educational video "${video.title}" by ${video.channel} covers important concepts in its field. The video provides structured learning content designed to help students understand key principles and applications. Through clear explanations and examples, viewers will gain practical knowledge that can be applied in real-world scenarios. The content is presented in an accessible manner suitable for students at various learning levels.`,
        keyPoints: [
          'Introduction to core concepts and terminology',
          'Step-by-step explanation of key processes',
          'Practical examples and case studies',
          'Common misconceptions and how to avoid them',
          'Best practices and expert recommendations',
          'Real-world applications and use cases'
        ],
        difficulty: 'intermediate' as const,
        suggestedFollowUp: [
          'Advanced topics in the same subject area',
          'Related practical applications',
          'Historical context and development'
        ]
      };
    }
  }

  /**
   * Generate quiz questions based on video content
   */
  async generateQuiz(video: Video, questionCount: number = 10): Promise<AIQuizResponse> {
    const prompt = `
As an educational expert, create a comprehensive ${questionCount}-question quiz based on this educational video:

Title: ${video.title}
Channel: ${video.channel}
Description: ${video.description.substring(0, 800)}...

Create HIGH-QUALITY, CONCEPT-FOCUSED questions that test deep understanding of the material. Include:

1. **Conceptual Understanding Questions** (40%): Test core concepts, principles, and theories
2. **Application Questions** (30%): Test ability to apply knowledge to new situations
3. **Analysis Questions** (20%): Test critical thinking and problem-solving skills
4. **Synthesis Questions** (10%): Test ability to combine concepts and draw conclusions

Question Requirements:
- Each question should have 4 well-crafted options (no obvious answers)
- Focus on WHY and HOW, not just WHAT
- Include scenario-based questions when applicable
- Test understanding at different cognitive levels
- Avoid trivial or memorization-only questions
- Make incorrect options plausible but clearly wrong to experts

Provide detailed explanations that:
- Explain why the correct answer is right
- Briefly explain why other options are incorrect
- Include additional context or related concepts

Respond in JSON format:
{
  "questions": [
    {
      "question": "Detailed conceptual question testing deep understanding",
      "options": ["Plausible option A", "Plausible option B", "Plausible option C", "Plausible option D"],
      "correctAnswer": 0,
      "explanation": "Comprehensive explanation of correct answer and why others are wrong, with additional context",
      "questionType": "conceptual|application|analysis|synthesis",
      "difficulty": "easy|medium|hard"
    }
  ],
  "topic": "Specific topic covered in the video",
  "learningObjectives": ["objective 1", "objective 2", "objective 3"]
}`;

    const response = await this.makeRequest([
      { role: 'user', content: prompt }
    ]);

    try {
      return JSON.parse(response);
    } catch (error) {
      // Enhanced fallback with better questions
      return {
        questions: [
          {
            question: `Based on the concepts presented in "${video.title}", which principle is most fundamental to understanding the topic?`,
            options: [
              'The foundational concept that underlies all other principles',
              'A secondary principle that supports the main idea',
              'An advanced application that requires prerequisite knowledge',
              'A common misconception that students often have'
            ],
            correctAnswer: 0,
            explanation: 'The foundational concept is most important because it provides the framework for understanding all other related principles and applications.'
          },
          {
            question: `How would you apply the knowledge from this video to solve a real-world problem?`,
            options: [
              'By following the exact steps shown without modification',
              'By adapting the principles to fit the specific context and constraints',
              'By memorizing the examples and repeating them exactly',
              'By ignoring the theoretical aspects and focusing only on practical steps'
            ],
            correctAnswer: 1,
            explanation: 'Real-world applications require adapting principles to specific contexts rather than rigid adherence to examples.'
          }
        ],
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