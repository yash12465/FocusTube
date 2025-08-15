from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
import openai
import re
import os
from typing import Dict, List, Any
import json

app = Flask(__name__)
CORS(app)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

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

def get_transcript(video_id: str) -> str:
    """Fetch and combine transcript from YouTube video"""
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        
        # Combine all transcript text
        full_transcript = ' '.join([entry['text'] for entry in transcript_list])
        
        # Clean up the transcript
        full_transcript = re.sub(r'\[.*?\]', '', full_transcript)  # Remove annotations
        full_transcript = re.sub(r'\s+', ' ', full_transcript)  # Normalize whitespace
        
        return full_transcript.strip()
    
    except Exception as e:
        # Try to get auto-generated transcript if manual one fails
        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
            full_transcript = ' '.join([entry['text'] for entry in transcript_list])
            full_transcript = re.sub(r'\[.*?\]', '', full_transcript)
            full_transcript = re.sub(r'\s+', ' ', full_transcript)
            return full_transcript.strip()
        except Exception as e2:
            raise Exception(f"Could not fetch transcript: {str(e2)}")

def generate_summary_and_questions(transcript: str, video_title: str = "") -> Dict[str, Any]:
    """Generate comprehensive summary and questions using OpenAI"""
    
    prompt = f"""
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

    Video Title: {video_title}
    
    Transcript:
    {transcript}

    Please format your response as valid JSON with this structure:
    {{
        "summary": {{
            "main_points": ["point1", "point2", ...],
            "key_concepts": ["concept1", "concept2", ...],
            "prerequisites": ["prereq1", "prereq2", ...],
            "applications": ["app1", "app2", ...],
            "detailed_explanation": "detailed 300+ word explanation",
            "follow_up_topics": ["topic1", "topic2", ...]
        }},
        "questions": [
            {{
                "question": "Question text",
                "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
                "correct_answer": 0,
                "explanation": "Why this answer is correct",
                "difficulty": "Beginner/Intermediate/Advanced",
                "type": "conceptual/application/analysis/synthesis"
            }}
        ]
    }}
    """

    try:
        # Using the latest OpenAI model - gpt-4o was released May 13, 2024. do not change this unless explicitly requested by the user
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system", 
                    "content": "You are an expert educational content creator. Provide comprehensive, accurate educational content based on video transcripts. Always respond with valid JSON."
                },
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=4000,
            temperature=0.7
        )
        
        content = response.choices[0].message.content
        if content is None:
            raise Exception("No content received from OpenAI")
        result = json.loads(content)
        return result
        
    except Exception as e:
        raise Exception(f"Error generating content with AI: {str(e)}")

def ask_question_about_transcript(question: str, transcript: str, video_title: str = "") -> str:
    """Answer student questions based on the video transcript"""
    
    prompt = f"""
    You are an AI tutor helping a student understand a YouTube video. Based on the transcript provided, answer the student's question clearly and comprehensively.

    Video Title: {video_title}
    Student Question: {question}
    
    Video Transcript:
    {transcript}

    Please provide:
    1. A direct answer to the question
    2. Relevant context from the video
    3. Additional explanations if needed
    4. Related concepts the student should understand
    
    If the question cannot be answered from the transcript, politely explain that and suggest what information would be needed.
    """

    try:
        response = openai.chat.completions.create(
            model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages=[
                {
                    "role": "system", 
                    "content": "You are a helpful AI tutor. Provide clear, educational responses based on video content."
                },
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        content = response.choices[0].message.content
        if content is None:
            raise Exception("No response content received from OpenAI")
        return content
        
    except Exception as e:
        raise Exception(f"Error answering question: {str(e)}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "YouTube Transcript AI Processor"})

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
        
        # Get transcript
        transcript = get_transcript(video_id)
        
        if len(transcript) < 50:
            return jsonify({"error": "Transcript too short or unavailable"}), 400
        
        # Generate summary and questions
        ai_content = generate_summary_and_questions(transcript, video_title)
        
        return jsonify({
            "success": True,
            "video_id": video_id,
            "transcript": transcript,
            "summary": ai_content["summary"],
            "questions": ai_content["questions"],
            "transcript_length": len(transcript)
        })
        
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
        
        # Generate answer
        answer = ask_question_about_transcript(question, transcript, video_title)
        
        return jsonify({
            "success": True,
            "question": question,
            "answer": answer
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
    app.run(host='0.0.0.0', port=port, debug=True)