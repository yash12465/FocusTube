import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SearchFiltersComponent from "@/components/search-filters";
import StudyTimer from "@/components/study-timer";
import { 
  Clock, 
  BookOpen, 
  CheckSquare, 
  Target, 
  Calendar,
  Music,
  TrendingUp,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

export default function Dashboard() {
  const [showTimer, setShowTimer] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  // Fetch user stats
  const { data: totalStudyTime } = useQuery({
    queryKey: ['/api/study-time/total'],
  });

  const { data: todaysGoals } = useQuery({
    queryKey: ['/api/goals/today'],
  });

  const motivationalQuotes = [
    "The expert in anything was once a beginner.",
    "Success is the sum of small efforts repeated day in and day out.",
    "Education is the most powerful weapon which you can use to change the world.",
    "The beautiful thing about learning is that no one can take it away from you.",
    "Study hard, for the well is deep, and our brains are shallow."
  ];

  const todayQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className="min-h-screen bg-slate-50">
      <SearchFiltersComponent 
        searchQuery=""
        setSearchQuery={() => {}}
        selectedSubject=""
        setSelectedSubject={() => {}}
        filters={{ subject: "", duration: "", level: "", channels: [] }}
        setFilters={() => {}}
        onSearch={() => {}}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Study Dashboard</h1>
          <p className="text-lg text-slate-600">Your personalized learning hub</p>
        </div>

        {/* Motivational Quote */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <p className="text-lg italic text-slate-700 text-center">"{todayQuote}"</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Study Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.floor(((totalStudyTime as any)?.totalTime || 0) / 60)}h {((totalStudyTime as any)?.totalTime || 0) % 60}m</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          {/* Quick Timer */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pomodoro Timer</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowTimer(!showTimer)}
                className="w-full"
                variant={showTimer ? "secondary" : "default"}
              >
                {showTimer ? "Hide Timer" : "Start Session"}
              </Button>
            </CardContent>
          </Card>

          {/* Focus Music */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Focus Music</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setMusicPlaying(!musicPlaying)}
                >
                  {musicPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <span className="text-sm text-slate-600">
                  {musicPlaying ? "Playing Lo-fi" : "Paused"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Today's Progress */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">75%</div>
              <p className="text-xs text-muted-foreground">Daily goals completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span>Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">Create and organize your study notes by subject</p>
              <Button onClick={() => window.location.href = '/notes'} className="w-full">
                Open Notes
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckSquare className="h-5 w-5 text-green-600" />
                <span>Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">Track assignments, projects, and exam dates</p>
              <Button onClick={() => window.location.href = '/tasks'} className="w-full">
                Manage Tasks
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RotateCcw className="h-5 w-5 text-purple-600" />
                <span>Flashcards</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">Create flashcards and practice with spaced repetition</p>
              <Button onClick={() => window.location.href = '/flashcards'} className="w-full">
                Study Cards
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Study Schedule Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Today's Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">Mathematics Study</p>
                  <p className="text-sm text-slate-600">09:00 - 10:30</p>
                </div>
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">Science Review</p>
                  <p className="text-sm text-slate-600">14:00 - 15:30</p>
                </div>
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              </div>
              <Button 
                onClick={() => window.location.href = '/schedule'} 
                variant="outline" 
                className="w-full"
              >
                View Full Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Timer */}
      {showTimer && <StudyTimer onClose={() => setShowTimer(false)} />}
    </div>
  );
}