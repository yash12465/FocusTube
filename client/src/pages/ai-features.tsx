import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Search, 
  FileText, 
  HelpCircle, 
  Users, 
  Shield, 
  TrendingUp, 
  MessageSquare,
  Zap,
  Target,
  BookOpen,
  Clock,
  Star,
  ArrowRight
} from "lucide-react";

export default function AIFeatures() {
  const currentFeatures = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Smart Search",
      description: "Get intelligent video recommendations based on natural language queries",
      status: "implemented",
      details: [
        "Natural language processing for better search understanding",
        "Context-aware recommendations based on your learning level",
        "Alternative search terms and related topics",
        "Educational content curation from trusted sources"
      ]
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "AI Video Summaries",
      description: "Automatic generation of key points and learning objectives",
      status: "implemented",
      details: [
        "Concise video summaries highlighting main concepts",
        "Key learning points extraction",
        "Difficulty level assessment",
        "Suggested follow-up topics for continued learning"
      ]
    },
    {
      icon: <HelpCircle className="w-6 h-6" />,
      title: "AI Quiz Generation",
      description: "Personalized quizzes based on video content for better retention",
      status: "implemented",
      details: [
        "Multiple-choice questions generated from video content",
        "Instant feedback with detailed explanations",
        "Progress tracking and scoring",
        "Retake functionality for improved learning"
      ]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Content Moderation",
      description: "AI-powered filtering to ensure educational quality",
      status: "implemented",
      details: [
        "Automatic educational content validation",
        "Inappropriate content filtering",
        "Quality assessment for learning materials",
        "Trusted source verification"
      ]
    }
  ];

  const advancedFeatures = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Personalized Learning Paths",
      description: "AI-driven personalized study recommendations based on your learning history, goals, and performance",
      priority: "high",
      complexity: "medium",
      benefits: [
        "Adaptive learning progression based on your pace",
        "Skill gap identification and targeted recommendations",
        "Learning style adaptation (visual, auditory, kinesthetic)",
        "Progress milestones and achievement tracking"
      ],
      implementation: "Track user watch history, quiz scores, and learning preferences to build a comprehensive learner profile. Use machine learning to recommend optimal learning sequences and identify knowledge gaps."
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "AI Learning Assistant Chatbot",
      description: "Real-time conversational AI to answer questions and provide explanations about video content",
      priority: "high",
      complexity: "high",
      benefits: [
        "Instant answers to subject-specific questions",
        "Concept clarification and deeper explanations",
        "Study session guidance and motivation",
        "24/7 availability for learning support"
      ],
      implementation: "Integrate with video transcripts and educational knowledge bases. Use conversational AI to provide contextual help during study sessions and answer questions about specific topics."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Intelligent Progress Analytics",
      description: "AI-powered insights into learning patterns with predictive analytics for optimal study planning",
      priority: "medium",
      complexity: "medium",
      benefits: [
        "Learning velocity tracking and predictions",
        "Optimal study time recommendations",
        "Retention rate analysis and improvement suggestions",
        "Performance forecasting for exams and goals"
      ],
      implementation: "Analyze study patterns, quiz performance, and engagement metrics. Use predictive models to suggest optimal study schedules and identify potential learning challenges before they occur."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Smart Exam Preparation",
      description: "AI-generated practice tests and study guides tailored to specific exams and subjects",
      priority: "high",
      complexity: "medium",
      benefits: [
        "Exam-specific question generation",
        "Weak area identification and targeted practice",
        "Adaptive difficulty based on performance",
        "Time management training for exam conditions"
      ],
      implementation: "Build knowledge bases for popular exams (SAT, GRE, professional certifications). Generate practice questions that mirror real exam patterns and adapt difficulty based on user performance."
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "AI Study Group Matching",
      description: "Intelligent peer matching for collaborative learning based on subjects, levels, and learning goals",
      priority: "medium",
      complexity: "high",
      benefits: [
        "Compatible study partner recommendations",
        "Group formation based on complementary strengths",
        "Collaborative study session scheduling",
        "Peer learning effectiveness tracking"
      ],
      implementation: "Analyze user profiles, subject interests, learning levels, and study patterns. Use matching algorithms to form effective study groups and facilitate collaborative learning sessions."
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'high': return 'bg-purple-100 text-purple-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Learning Features
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how artificial intelligence enhances your educational journey on FocusTube
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current Features */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Current AI Features</h2>
            <p className="text-lg text-gray-600">
              Experience the power of AI in your learning journey today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentFeatures.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {feature.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <Badge className={getStatusColor(feature.status)}>
                          {feature.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Advanced Features */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Future AI Enhancements</h2>
            <p className="text-lg text-gray-600">
              Revolutionary features that could transform your learning experience
            </p>
          </div>

          <div className="space-y-6">
            {advancedFeatures.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-purple-200 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                        <CardDescription className="text-base mb-3">
                          {feature.description}
                        </CardDescription>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(feature.priority)}>
                            {feature.priority} priority
                          </Badge>
                          <Badge className={getComplexityColor(feature.complexity)}>
                            {feature.complexity} complexity
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Key Benefits
                    </h4>
                    <ul className="space-y-1">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <ArrowRight className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      Implementation Approach
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.implementation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-purple-100 border-primary/20">
            <CardContent className="p-8">
              <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Experience AI-Powered Learning?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Start using our current AI features today and help shape the future of educational technology. 
                Your feedback and usage patterns help us develop even better learning tools.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild size="lg">
                  <a href="/">
                    <Search className="w-4 h-4 mr-2" />
                    Try AI Search
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="/dashboard">
                    <Clock className="w-4 h-4 mr-2" />
                    View Dashboard
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}