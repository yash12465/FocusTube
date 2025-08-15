import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Brain, 
  FileText, 
  MessageSquare, 
  Search, 
  CheckCircle, 
  XCircle,
  Loader2,
  Youtube,
  Lightbulb,
  BookOpen,
  Target,
  Users,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const API_BASE_URL = '/api/transcript';

export function TranscriptAIProcessor() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedVideo, setProcessedVideo] = useState<ProcessedVideo | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [studentQuestion, setStudentQuestion] = useState('');
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const { toast } = useToast();
  const progressInterval = useRef<NodeJS.Timeout>();

  const startProgress = () => {
    setProgress(0);
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);
  };

  const stopProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    setProgress(100);
    setTimeout(() => setProgress(0), 1000);
  };

  const extractVideoId = (url: string): string => {
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
  };

  const processVideo = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setIsProcessing(true);
    setError('');
    startProgress();

    try {
      const response = await fetch(`${API_BASE_URL}/process-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_url: videoUrl,
          video_title: `Video ${extractVideoId(videoUrl)}`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process video');
      }

      setProcessedVideo(data);
      setSelectedAnswers([]);
      setCurrentQuestionIndex(0);
      setShowResults(false);
      
      toast({
        title: "Video Processed Successfully!",
        description: `Generated ${data.questions.length} questions from ${Math.floor(data.transcript_length / 100)} minutes of content.`,
      });

    } catch (err: any) {
      setError(err.message || 'Failed to process video');
      toast({
        title: "Processing Failed",
        description: err.message || 'Could not process the video. Please check the URL and try again.',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      stopProgress();
    }
  };

  const askQuestion = async () => {
    if (!studentQuestion.trim() || !processedVideo) {
      return;
    }

    setIsAnswering(true);
    setQuestionAnswer('');

    try {
      const response = await fetch(`${API_BASE_URL}/ask-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: studentQuestion,
          transcript: processedVideo.transcript,
          video_title: `Video ${processedVideo.video_id}`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      setQuestionAnswer(data.answer);
      
    } catch (err: any) {
      toast({
        title: "Question Failed",
        description: err.message || 'Could not get answer to your question.',
        variant: "destructive",
      });
    } finally {
      setIsAnswering(false);
    }
  };

  const searchTranscript = async () => {
    if (!searchQuery.trim() || !processedVideo) {
      return;
    }

    setIsSearching(true);
    setSearchResults([]);

    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          transcript: processedVideo.transcript
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search transcript');
      }

      setSearchResults(data.results);
      
    } catch (err: any) {
      toast({
        title: "Search Failed",
        description: err.message || 'Could not search the transcript.',
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const calculateScore = () => {
    if (!processedVideo) return 0;
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === processedVideo.questions[index]?.correct_answer) {
        correct++;
      }
    });
    return Math.round((correct / processedVideo.questions.length) * 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'conceptual': return 'bg-blue-100 text-blue-800';
      case 'application': return 'bg-purple-100 text-purple-800';
      case 'analysis': return 'bg-orange-100 text-orange-800';
      case 'synthesis': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Youtube className="w-6 h-6 text-red-600" />
            YouTube Transcript AI Processor
          </CardTitle>
          <CardDescription>
            Generate comprehensive summaries and quizzes from actual YouTube video transcripts using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Paste YouTube URL here (e.g., https://www.youtube.com/watch?v=...)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={processVideo} 
              disabled={isProcessing}
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
          
          {isProcessing && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Processing video transcript...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <XCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {processedVideo && (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">
              <FileText className="w-4 h-4 mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="quiz">
              <Target className="w-4 h-4 mr-2" />
              Quiz ({processedVideo.questions.length})
            </TabsTrigger>
            <TabsTrigger value="qa">
              <MessageSquare className="w-4 h-4 mr-2" />
              Q&A
            </TabsTrigger>
            <TabsTrigger value="search">
              <Search className="w-4 h-4 mr-2" />
              Search
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Video Info */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-red-600" />
                    Video Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${processedVideo.video_id}`}
                      frameBorder="0"
                      allowFullScreen
                      className="rounded-lg"
                    ></iframe>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Video ID:</span>
                      <span className="font-mono">{processedVideo.video_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transcript Length:</span>
                      <span>{processedVideo.transcript_length.toLocaleString()} chars</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Est. Duration:</span>
                      <span>{Math.ceil(processedVideo.transcript_length / 1000)} minutes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Content */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI-Generated Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Detailed Explanation */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Detailed Overview
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {processedVideo.summary.detailed_explanation}
                    </p>
                  </div>

                  {/* Key Concepts */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Key Concepts
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {processedVideo.summary.key_concepts.map((concept, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Main Points */}
                  <div>
                    <h4 className="font-semibold mb-3">Main Learning Points</h4>
                    <ul className="space-y-2">
                      {processedVideo.summary.main_points.map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prerequisites */}
                  {processedVideo.summary.prerequisites.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Prerequisites</h4>
                      <div className="flex flex-wrap gap-2">
                        {processedVideo.summary.prerequisites.map((prereq, index) => (
                          <Badge key={index} variant="outline" className="bg-orange-50">
                            {prereq}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Applications */}
                  {processedVideo.summary.applications.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Real-World Applications</h4>
                      <ul className="space-y-1">
                        {processedVideo.summary.applications.map((app, index) => (
                          <li key={index} className="text-gray-700">• {app}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Follow-up Topics */}
                  {processedVideo.summary.follow_up_topics.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Follow-up Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {processedVideo.summary.follow_up_topics.map((topic, index) => (
                          <Badge key={index} variant="outline" className="bg-purple-50">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  AI-Generated Quiz
                </CardTitle>
                <CardDescription>
                  Test your understanding with questions generated from the video transcript
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showResults ? (
                  <div className="space-y-6">
                    {/* Progress */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Question {currentQuestionIndex + 1} of {processedVideo.questions.length}
                      </span>
                      <div className="flex gap-2">
                        <Badge className={getDifficultyColor(processedVideo.questions[currentQuestionIndex]?.difficulty)}>
                          {processedVideo.questions[currentQuestionIndex]?.difficulty}
                        </Badge>
                        <Badge className={getTypeColor(processedVideo.questions[currentQuestionIndex]?.type)}>
                          {processedVideo.questions[currentQuestionIndex]?.type}
                        </Badge>
                      </div>
                    </div>

                    <Progress 
                      value={((currentQuestionIndex + 1) / processedVideo.questions.length) * 100} 
                      className="h-2" 
                    />

                    {/* Question */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        {processedVideo.questions[currentQuestionIndex]?.question}
                      </h3>

                      <div className="space-y-3">
                        {processedVideo.questions[currentQuestionIndex]?.options.map((option, index) => (
                          <Button
                            key={index}
                            variant={selectedAnswers[currentQuestionIndex] === index ? "default" : "outline"}
                            className="w-full text-left justify-start h-auto p-4"
                            onClick={() => handleAnswerSelect(index)}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>

                      {/* Navigation */}
                      <div className="flex justify-between pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                          disabled={currentQuestionIndex === 0}
                        >
                          Previous
                        </Button>

                        {currentQuestionIndex === processedVideo.questions.length - 1 ? (
                          <Button
                            onClick={() => setShowResults(true)}
                            disabled={selectedAnswers.length !== processedVideo.questions.length}
                          >
                            View Results
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                            disabled={selectedAnswers[currentQuestionIndex] === undefined}
                          >
                            Next
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Results */
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
                      <div className="text-4xl font-bold text-green-600 mb-4">
                        {calculateScore()}%
                      </div>
                      <p className="text-gray-600">
                        You got {selectedAnswers.filter((answer, index) => 
                          answer === processedVideo.questions[index]?.correct_answer
                        ).length} out of {processedVideo.questions.length} questions correct.
                      </p>
                    </div>

                    <Button
                      onClick={() => {
                        setShowResults(false);
                        setCurrentQuestionIndex(0);
                        setSelectedAnswers([]);
                      }}
                      className="w-full"
                    >
                      Retake Quiz
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Q&A Tab */}
          <TabsContent value="qa">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Ask Questions About the Video
                </CardTitle>
                <CardDescription>
                  Get AI-powered answers based on the video transcript
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Textarea
                    placeholder="Ask a question about the video content..."
                    value={studentQuestion}
                    onChange={(e) => setStudentQuestion(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={askQuestion} 
                    disabled={isAnswering || !studentQuestion.trim()}
                    className="self-end"
                  >
                    {isAnswering ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {questionAnswer && (
                  <Card className="bg-blue-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">AI Tutor Response:</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{questionAnswer}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-600" />
                  Search Video Transcript
                </CardTitle>
                <CardDescription>
                  Find specific topics or concepts mentioned in the video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Search for concepts, keywords, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button 
                    onClick={searchTranscript} 
                    disabled={isSearching || !searchQuery.trim()}
                  >
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Search Results:</h4>
                    {searchResults.map((result, index) => (
                      <Card key={index} className="bg-gray-50">
                        <CardContent className="p-4">
                          <p className="text-gray-700">{result.text}</p>
                          <div className="mt-2">
                            <Badge variant="outline">
                              Relevance: {result.relevance_score}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}