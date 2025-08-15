import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Clock, 
  BookOpen, 
  Star, 
  ArrowRight,
  BarChart3,
  Lightbulb,
  Calendar
} from 'lucide-react';

interface LearningAnalytics {
  totalWatchTime: number;
  averageQuizScore: number;
  conceptsMastered: number;
  learningStreak: number;
  strongSubjects: string[];
  improvementAreas: string[];
  recommendedStudyTime: number;
  nextMilestone: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  topics: string[];
  prerequisitesMet: boolean;
  progress: number;
}

export function AILearningAnalytics() {
  // Mock data - in real implementation, this would come from AI analysis
  const analytics: LearningAnalytics = {
    totalWatchTime: 1847, // minutes
    averageQuizScore: 78,
    conceptsMastered: 24,
    learningStreak: 7,
    strongSubjects: ['Mathematics', 'Programming', 'Physics'],
    improvementAreas: ['Advanced Calculus', 'Data Structures'],
    recommendedStudyTime: 45,
    nextMilestone: 'Complete Linear Algebra fundamentals'
  };

  const personalizedPaths: LearningPath[] = [
    {
      id: '1',
      title: 'Advanced Programming Concepts',
      description: 'Build on your programming foundation with advanced algorithms and design patterns',
      difficulty: 'intermediate',
      estimatedTime: '3-4 weeks',
      topics: ['Algorithms', 'Design Patterns', 'Data Structures', 'System Design'],
      prerequisitesMet: true,
      progress: 35
    },
    {
      id: '2',
      title: 'Mathematical Foundations for Computer Science',
      description: 'Strengthen mathematical concepts essential for advanced CS topics',
      difficulty: 'intermediate',
      estimatedTime: '5-6 weeks',
      topics: ['Discrete Math', 'Linear Algebra', 'Statistics', 'Calculus'],
      prerequisitesMet: true,
      progress: 15
    },
    {
      id: '3',
      title: 'Machine Learning Fundamentals',
      description: 'Introduction to ML concepts, algorithms, and practical applications',
      difficulty: 'advanced',
      estimatedTime: '8-10 weeks',
      topics: ['Supervised Learning', 'Neural Networks', 'Python/TensorFlow', 'Statistics'],
      prerequisitesMet: false,
      progress: 0
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Learning Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Study Time</p>
                <p className="text-2xl font-bold">{formatTime(analytics.totalWatchTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Quiz Score</p>
                <p className="text-2xl font-bold">{analytics.averageQuizScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concepts Mastered</p>
                <p className="text-2xl font-bold">{analytics.conceptsMastered}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Learning Streak</p>
                <p className="text-2xl font-bold">{analytics.learningStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths and Improvement Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Your Strengths
            </CardTitle>
            <CardDescription>
              Subjects where you're performing well
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.strongSubjects.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">{subject}</span>
                  <Badge className="bg-green-100 text-green-700">Strong</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Focus Areas
            </CardTitle>
            <CardDescription>
              Topics that need more attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.improvementAreas.map((area, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-800">{area}</span>
                  <Badge className="bg-blue-100 text-blue-700">Focus</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Personalized suggestions based on your learning patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="font-semibold">Optimal Study Time</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Based on your performance patterns, study for {analytics.recommendedStudyTime} minutes daily between 2-4 PM for best retention.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="font-semibold">Next Milestone</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {analytics.nextMilestone}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalized Learning Paths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Personalized Learning Paths
          </CardTitle>
          <CardDescription>
            AI-curated learning sequences tailored to your goals and current level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {personalizedPaths.map((path) => (
              <Card key={path.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{path.title}</h3>
                        <Badge className={getDifficultyColor(path.difficulty)}>
                          {path.difficulty}
                        </Badge>
                        {!path.prerequisitesMet && (
                          <Badge variant="outline" className="border-orange-300 text-orange-700">
                            Prerequisites needed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {path.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>⏱️ {path.estimatedTime}</span>
                        <span>📚 {path.topics.length} topics</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {path.topics.map((topic, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      {path.progress > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{path.progress}%</span>
                          </div>
                          <Progress value={path.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                    <Button 
                      variant={path.prerequisitesMet ? "default" : "secondary"} 
                      size="sm"
                      disabled={!path.prerequisitesMet}
                      className="ml-4"
                    >
                      {path.progress > 0 ? 'Continue' : 'Start'}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}