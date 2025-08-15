import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  BookOpen, 
  Target, 
  Users, 
  MessageSquare, 
  BarChart3,
  Clock,
  Calendar,
  Star,
  Lightbulb,
  ArrowRight,
  Bell,
  Settings,
  Play
} from 'lucide-react';
import { AILearningAnalytics } from '@/components/ai-learning-analytics';

interface StudyReminder {
  id: string;
  title: string;
  description: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  type: 'study' | 'quiz' | 'review';
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'performance' | 'recommendation' | 'milestone';
  importance: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export default function AIDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for AI-powered features
  const todayReminders: StudyReminder[] = [
    {
      id: '1',
      title: 'Linear Algebra Practice',
      description: 'Complete chapter 3 exercises based on your performance gaps',
      time: '2:00 PM',
      priority: 'high',
      type: 'study'
    },
    {
      id: '2',
      title: 'Programming Quiz Review',
      description: 'Review incorrect answers from yesterday\'s algorithm quiz',
      time: '4:30 PM',
      priority: 'medium',
      type: 'review'
    },
    {
      id: '3',
      title: 'Spaced Repetition: Data Structures',
      description: 'Time for your scheduled review of binary trees concepts',
      time: '6:00 PM',
      priority: 'medium',
      type: 'quiz'
    }
  ];

  const aiInsights: AIInsight[] = [
    {
      id: '1',
      title: 'Learning Velocity Increasing',
      description: 'Your comprehension speed has improved by 23% this week. Consider tackling more advanced topics.',
      type: 'performance',
      importance: 'high',
      actionable: true
    },
    {
      id: '2',
      title: 'Optimal Study Time Detected',
      description: 'You perform 40% better between 2-4 PM. Schedule challenging topics during this window.',
      type: 'recommendation',
      importance: 'high',
      actionable: true
    },
    {
      id: '3',
      title: 'Milestone Achievement',
      description: 'Congratulations! You\'ve mastered 85% of beginner programming concepts.',
      type: 'milestone',
      importance: 'medium',
      actionable: false
    }
  ];

  const upcomingFeatures = [
    {
      title: 'AI Study Group Matching',
      description: 'Connect with peers who complement your learning style and goals',
      status: 'Coming Soon',
      progress: 75
    },
    {
      title: 'Voice-to-Text Study Notes',
      description: 'Speak your thoughts and let AI organize them into structured notes',
      status: 'In Development',
      progress: 45
    },
    {
      title: 'Adaptive Learning Games',
      description: 'Gamified learning experiences that adjust difficulty in real-time',
      status: 'Planning',
      progress: 20
    },
    {
      title: 'AI Tutoring Assistant',
      description: 'Conversational AI that answers questions and provides explanations',
      status: 'Beta Testing',
      progress: 90
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'performance': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'recommendation': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'milestone': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Coming Soon': return 'bg-blue-100 text-blue-800';
      case 'In Development': return 'bg-yellow-100 text-yellow-800';
      case 'Planning': return 'bg-gray-100 text-gray-800';
      case 'Beta Testing': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Learning Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Personalized insights and recommendations powered by artificial intelligence
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <div className="relative">
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="recommendations">AI Insights</TabsTrigger>
            <TabsTrigger value="features">Future Features</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Brain className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">AI Features Used</p>
                      <p className="text-2xl font-bold">47</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Learning Efficiency</p>
                      <p className="text-2xl font-bold">+23%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Goals Achieved</p>
                      <p className="text-2xl font-bold">12/15</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">AI Interactions</p>
                      <p className="text-2xl font-bold">156</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's AI-Powered Reminders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Today's AI-Powered Study Plan
                </CardTitle>
                <CardDescription>
                  Personalized recommendations based on your learning patterns and goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayReminders.map((reminder) => (
                    <Card key={reminder.id} className={`border-l-4 ${getPriorityColor(reminder.priority)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{reminder.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {reminder.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {reminder.description}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {reminder.time}
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Recent AI Insights
                </CardTitle>
                <CardDescription>
                  Intelligent analysis of your learning patterns and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiInsights.slice(0, 3).map((insight) => (
                    <Alert key={insight.id} className={getInsightColor(insight.type)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <AlertTitle className="text-sm font-semibold mb-1">
                            {insight.title}
                          </AlertTitle>
                          <AlertDescription className="text-sm">
                            {insight.description}
                          </AlertDescription>
                        </div>
                        {insight.actionable && (
                          <Button size="sm" variant="outline" className="ml-4">
                            Act on it
                          </Button>
                        )}
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AILearningAnalytics />
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  All AI Insights & Recommendations
                </CardTitle>
                <CardDescription>
                  Comprehensive analysis and actionable recommendations for your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsights.map((insight) => (
                    <Card key={insight.id} className={`border ${getInsightColor(insight.type)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{insight.title}</h3>
                              <Badge variant="outline">
                                {insight.type}
                              </Badge>
                              <Badge variant="outline" className={insight.importance === 'high' ? 'border-red-300 text-red-700' : ''}>
                                {insight.importance} priority
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {insight.description}
                            </p>
                          </div>
                          {insight.actionable && (
                            <Button size="sm">
                              Take Action
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Future Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Upcoming AI Features
                </CardTitle>
                <CardDescription>
                  Revolutionary features in development to enhance your learning experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingFeatures.map((feature, index) => (
                    <Card key={index} className="border-2 border-dashed hover:border-solid transition-all">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">{feature.title}</h3>
                            <Badge className={getStatusColor(feature.status)}>
                              {feature.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Development Progress</span>
                              <span>{feature.progress}%</span>
                            </div>
                            <Progress value={feature.progress} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feature Request Section */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
              <CardContent className="p-8 text-center">
                <Brain className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Have an AI Feature Idea?
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Help us shape the future of AI-powered learning. Share your ideas for features that would enhance your educational journey.
                </p>
                <Button size="lg">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Submit Feature Request
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}