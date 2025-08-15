import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  FileText, 
  Brain, 
  HelpCircle, 
  CheckCircle2, 
  XCircle,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import { generateVideoSummary, generateQuiz, AIVideoSummaryResponse, AIQuizResponse, AIQuizQuestion } from '@/lib/ai-api';
import { Video } from '@/types/video';
import { useToast } from '@/hooks/use-toast';

interface AIVideoDetailsProps {
  video: Video;
  isOpen: boolean;
  onClose: () => void;
}

export function AIVideoDetails({ video, isOpen, onClose }: AIVideoDetailsProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  // AI Summary Query
  const summaryQuery = useQuery({
    queryKey: ['ai-summary', video.id],
    queryFn: () => generateVideoSummary(video),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // AI Quiz Generation Mutation
  const quizMutation = useMutation({
    mutationFn: () => generateQuiz(video, 5),
    onSuccess: () => {
      setCurrentQuestionIndex(0);
      setSelectedAnswers([]);
      setShowResults(false);
      toast({
        title: "Quiz Generated",
        description: "Your personalized quiz is ready!"
      });
    },
    onError: () => {
      toast({
        title: "Quiz Generation Failed",
        description: "Couldn't generate quiz. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (quizMutation.data && currentQuestionIndex < quizMutation.data.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    if (!quizMutation.data) return 0;
    const correct = selectedAnswers.reduce((count, answer, index) => {
      return count + (answer === quizMutation.data.questions[index].correctAnswer ? 1 : 0);
    }, 0);
    return (correct / quizMutation.data.questions.length) * 100;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold">{video.title}</CardTitle>
              <CardDescription>by {video.channel}</CardDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                AI Summary
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Practice Quiz
              </TabsTrigger>
            </TabsList>

            {/* AI Summary Tab */}
            <TabsContent value="summary" className="mt-6">
              {summaryQuery.isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-2">Generating AI summary...</span>
                </div>
              )}

              {summaryQuery.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Failed to generate summary. Please try again later.
                  </AlertDescription>
                </Alert>
              )}

              {summaryQuery.data && (
                <div className="space-y-6">
                  {/* Difficulty Badge */}
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <Badge className={getDifficultyColor(summaryQuery.data.difficulty)}>
                      {summaryQuery.data.difficulty} level
                    </Badge>
                  </div>

                  {/* Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 leading-relaxed">
                        {summaryQuery.data.summary}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Key Points */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        Key Learning Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {summaryQuery.data.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <span className="text-slate-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Follow-up Topics */}
                  {summaryQuery.data.suggestedFollowUp.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">What to Learn Next</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {summaryQuery.data.suggestedFollowUp.map((topic, index) => (
                            <Badge key={index} variant="outline" className="hover:bg-primary/10">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Quiz Tab */}
            <TabsContent value="quiz" className="mt-6">
              {!quizMutation.data && (
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Generate Practice Quiz</h3>
                  <p className="text-slate-600 mb-4">
                    Test your understanding with AI-generated questions based on this video
                  </p>
                  <Button 
                    onClick={() => quizMutation.mutate()}
                    disabled={quizMutation.isPending}
                    className="px-6"
                  >
                    {quizMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Generate Quiz
                      </>
                    )}
                  </Button>
                </div>
              )}

              {quizMutation.data && !showResults && (
                <QuizQuestion
                  question={quizMutation.data.questions[currentQuestionIndex]}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={quizMutation.data.questions.length}
                  selectedAnswer={selectedAnswers[currentQuestionIndex]}
                  onAnswerSelect={handleAnswerSelect}
                  onNext={handleNextQuestion}
                  onPrevious={handlePreviousQuestion}
                  canGoNext={selectedAnswers[currentQuestionIndex] !== undefined}
                  canGoPrevious={currentQuestionIndex > 0}
                />
              )}

              {quizMutation.data && showResults && (
                <QuizResults
                  questions={quizMutation.data.questions}
                  selectedAnswers={selectedAnswers}
                  score={calculateScore()}
                  onRetake={() => {
                    setCurrentQuestionIndex(0);
                    setSelectedAnswers([]);
                    setShowResults(false);
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface QuizQuestionProps {
  question: AIQuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: number;
  onAnswerSelect: (index: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

function QuizQuestion({ 
  question, 
  questionNumber, 
  totalQuestions, 
  selectedAnswer, 
  onAnswerSelect, 
  onNext, 
  onPrevious, 
  canGoNext, 
  canGoPrevious 
}: QuizQuestionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Question {questionNumber} of {totalQuestions}</h3>
        <Progress value={(questionNumber / totalQuestions) * 100} className="w-32" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedAnswer === index ? "default" : "outline"}
              className="w-full text-left justify-start h-auto p-4"
              onClick={() => onAnswerSelect(index)}
            >
              <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
              {option}
            </Button>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPrevious} 
          disabled={!canGoPrevious}
        >
          Previous
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!canGoNext}
          className="px-6"
        >
          {questionNumber === totalQuestions ? 'Finish Quiz' : 'Next Question'}
        </Button>
      </div>
    </div>
  );
}

interface QuizResultsProps {
  questions: AIQuizQuestion[];
  selectedAnswers: number[];
  score: number;
  onRetake: () => void;
}

function QuizResults({ questions, selectedAnswers, score, onRetake }: QuizResultsProps) {
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    if (score >= 80) return 'Excellent work!';
    if (score >= 60) return 'Good job!';
    return 'Keep practicing!';
  };

  return (
    <div className="space-y-6">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          <CardDescription>
            <span className={`text-3xl font-bold ${getScoreColor()}`}>
              {Math.round(score)}%
            </span>
            <br />
            {getScoreMessage()}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {questions.map((question, index) => {
          const isCorrect = selectedAnswers[index] === question.correctAnswer;
          return (
            <Card key={index} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  Question {index + 1}
                </CardTitle>
                <CardDescription>{question.question}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Your answer:</strong> {question.options[selectedAnswers[index]]}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm">
                      <strong>Correct answer:</strong> {question.options[question.correctAnswer]}
                    </p>
                  )}
                  <p className="text-sm text-slate-600">
                    <strong>Explanation:</strong> {question.explanation}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Button onClick={onRetake} variant="outline">
          <HelpCircle className="w-4 h-4 mr-2" />
          Retake Quiz
        </Button>
      </div>
    </div>
  );
}