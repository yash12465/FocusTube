#!/usr/bin/env python3
"""
Simple Flask backend for YouTube transcript processing
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import json
import re

app = Flask(__name__)
CORS(app)

# Mock functions for development - will be replaced with real implementations
def extract_video_id(url: str) -> str:
    """Extract YouTube video ID from various URL formats"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'youtube\.com\/v\/([^&\n?#]+)',
        r'youtube\.com\/watch\?.*v=([^&\n?#]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    # If it's already just a video ID
    if len(url) == 11 and re.match(r'^[a-zA-Z0-9_-]+$', url):
        return url
    
    raise ValueError("Invalid YouTube URL or video ID")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy", 
        "service": "YouTube Transcript AI Processor",
        "openai_configured": bool(os.getenv('OPENAI_API_KEY'))
    })

@app.route('/process_video', methods=['POST'])
def process_video():
    """Main endpoint to process YouTube video and generate content"""
    try:
        data = request.get_json()
        
        if not data or 'video_url' not in data:
            return jsonify({"error": "video_url is required"}), 400
        
        video_url = data['video_url']
        video_title = data.get('video_title', '')
        
        # Extract video ID
        video_id = extract_video_id(video_url)
        
        # For now, return mock data - real transcript API will be implemented
        mock_transcript = f"""This is a mock transcript for video {video_id}. In the real implementation, this would contain the actual YouTube video transcript fetched using the youtube-transcript-api. The transcript would contain the spoken content of the video, which would then be processed by OpenAI to generate comprehensive summaries and educational questions.

Key concepts that might be covered in this video include:
- Main topic introduction and overview
- Detailed explanations of core concepts
- Practical examples and demonstrations
- Real-world applications and use cases
- Best practices and recommendations
- Common pitfalls and how to avoid them
- Advanced techniques and considerations
- Summary and key takeaways

The AI processing would analyze this transcript to identify the most important educational content and generate appropriate questions that test different levels of understanding."""

        # Mock AI-generated content
        mock_response = {
            "success": True,
            "video_id": video_id,
            "transcript": mock_transcript,
            "summary": {
                "main_points": [
                    "Introduction to the core topic and its importance",
                    "Detailed explanation of fundamental concepts",
                    "Practical examples and real-world applications",
                    "Best practices and recommended approaches",
                    "Common challenges and how to overcome them"
                ],
                "key_concepts": [
                    "Core Concept 1",
                    "Technical Framework",
                    "Best Practices",
                    "Implementation Strategy",
                    "Problem Solving"
                ],
                "prerequisites": [
                    "Basic understanding of the subject area",
                    "Familiarity with fundamental concepts",
                    "Some practical experience"
                ],
                "applications": [
                    "Industry applications and use cases",
                    "Academic research and study",
                    "Professional development",
                    "Problem-solving in real scenarios"
                ],
                "detailed_explanation": f"This comprehensive video covers essential topics related to {video_title or 'the subject matter'}. The content is structured to provide both theoretical understanding and practical application. The presenter begins by establishing the foundational concepts, ensuring viewers have the necessary background knowledge. Through clear explanations and relevant examples, complex ideas are broken down into manageable components. The video emphasizes practical implementation, showing how theoretical concepts apply in real-world scenarios. Throughout the presentation, best practices are highlighted, helping viewers avoid common pitfalls and implement solutions effectively. The content builds progressively, with each section reinforcing previous concepts while introducing new material. Interactive elements and demonstrations enhance understanding, making abstract concepts more concrete. The video concludes with actionable takeaways and resources for further learning.",
                "follow_up_topics": [
                    "Advanced techniques in this area",
                    "Related frameworks and methodologies",
                    "Case studies and examples",
                    "Further reading and resources"
                ]
            },
            "questions": [
                {
                    "question": "What is the main objective discussed in this video?",
                    "options": [
                        "A. To provide entertainment",
                        "B. To teach fundamental concepts and practical applications",
                        "C. To sell a product or service",
                        "D. To demonstrate a single technique"
                    ],
                    "correct_answer": 1,
                    "explanation": "The video focuses on educational content that combines theoretical understanding with practical application.",
                    "difficulty": "Beginner",
                    "type": "conceptual"
                },
                {
                    "question": "Which approach is recommended for implementing the concepts discussed?",
                    "options": [
                        "A. Start with advanced techniques immediately",
                        "B. Focus only on theory without practice",
                        "C. Build understanding progressively from fundamentals",
                        "D. Skip prerequisite knowledge"
                    ],
                    "correct_answer": 2,
                    "explanation": "The video emphasizes building understanding progressively, starting with fundamental concepts before moving to advanced applications.",
                    "difficulty": "Intermediate",
                    "type": "application"
                },
                {
                    "question": "How does the video structure its content for maximum learning effectiveness?",
                    "options": [
                        "A. Random presentation of topics",
                        "B. Theory only with no examples",
                        "C. Progressive building with examples and demonstrations",
                        "D. Advanced concepts first"
                    ],
                    "correct_answer": 2,
                    "explanation": "The video uses a progressive structure, building from fundamentals to advanced concepts with practical examples throughout.",
                    "difficulty": "Intermediate",
                    "type": "analysis"
                },
                {
                    "question": "What combination of elements makes this educational content most effective?",
                    "options": [
                        "A. Theory and examples only",
                        "B. Practice exercises only",
                        "C. Theory, examples, best practices, and real-world applications",
                        "D. Entertainment and basic facts"
                    ],
                    "correct_answer": 2,
                    "explanation": "Effective educational content combines theoretical understanding, practical examples, best practices, and real-world applications for comprehensive learning.",
                    "difficulty": "Advanced",
                    "type": "synthesis"
                }
            ],
            "transcript_length": len(mock_transcript)
        }
        
        return jsonify(mock_response)
        
    except ValueError as e:
        return jsonify({"error": f"Invalid video URL: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ask_question', methods=['POST'])
def ask_question():
    """Endpoint for students to ask questions about the video"""
    try:
        data = request.get_json()
        
        if not data or 'question' not in data or 'transcript' not in data:
            return jsonify({"error": "question and transcript are required"}), 400
        
        question = data['question']
        transcript = data['transcript']
        video_title = data.get('video_title', '')
        
        # Mock AI response
        mock_answer = f"""Based on the video content, here's my response to your question: "{question}"

This is a comprehensive answer that would be generated by analyzing the actual video transcript. In the real implementation, this would use OpenAI's GPT-4 to provide detailed, contextual answers based on the video content.

The answer would:
- Directly address your specific question
- Reference relevant parts of the video transcript
- Provide additional context and explanations
- Suggest related concepts you might want to explore
- Offer practical applications or examples

For a production system, this would be powered by OpenAI's latest models to ensure accurate, helpful responses based on the actual video content."""
        
        return jsonify({
            "success": True,
            "question": question,
            "answer": mock_answer
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/search_transcript', methods=['POST'])
def search_transcript():
    """Search for specific content within the transcript"""
    try:
        data = request.get_json()
        
        if not data or 'query' not in data or 'transcript' not in data:
            return jsonify({"error": "query and transcript are required"}), 400
        
        query = data['query'].lower()
        transcript = data['transcript']
        
        # Simple search implementation
        sentences = transcript.split('.')
        relevant_sentences = []
        
        for i, sentence in enumerate(sentences):
            if query in sentence.lower():
                # Include context (previous and next sentence)
                context_start = max(0, i-1)
                context_end = min(len(sentences), i+2)
                context = '. '.join(sentences[context_start:context_end]).strip()
                
                relevant_sentences.append({
                    "text": context,
                    "relevance_score": sentence.lower().count(query)
                })
        
        # Sort by relevance
        relevant_sentences.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        return jsonify({
            "success": True,
            "query": query,
            "results": relevant_sentences[:5],  # Top 5 results
            "total_matches": len(relevant_sentences)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"🚀 Starting YouTube Transcript AI Backend on port {port}")
    print(f"📝 OpenAI API Key: {'✓ Configured' if os.getenv('OPENAI_API_KEY') else '✗ Missing (using mock responses)'}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=True
    )