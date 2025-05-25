import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import SearchFiltersComponent from "@/components/search-filters";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, RotateCcw, BookOpen, Brain, ChevronLeft, ChevronRight } from "lucide-react";

interface Flashcard {
  id: number;
  front: string;
  back: string;
  subject: string | null;
  difficulty: "easy" | "medium" | "hard";
  nextReview: string;
  createdAt: string;
}

export default function Flashcards() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [flashcardForm, setFlashcardForm] = useState({
    front: "",
    back: "",
    subject: "",
    difficulty: "medium",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const subjects = [
    "Mathematics", "Science", "History", "Programming", 
    "Physics", "Chemistry", "Biology", "English"
  ];

  const difficultyColors = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    hard: "bg-red-100 text-red-700"
  };

  // Fetch flashcards
  const { data: flashcards, isLoading } = useQuery({
    queryKey: ['/api/flashcards'],
    select: (data: any) => data || []
  });

  // Create flashcard mutation
  const createFlashcardMutation = useMutation({
    mutationFn: async (flashcardData: any) => {
      return apiRequest('POST', '/api/flashcards', flashcardData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flashcards'] });
      setIsCreateModalOpen(false);
      setFlashcardForm({ front: "", back: "", subject: "", difficulty: "medium" });
      toast({ title: "Flashcard created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create flashcard", variant: "destructive" });
    },
  });

  // Update difficulty mutation
  const updateDifficultyMutation = useMutation({
    mutationFn: async ({ id, difficulty }: { id: number; difficulty: string }) => {
      return apiRequest('PATCH', `/api/flashcards/${id}`, { difficulty });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flashcards'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFlashcardMutation.mutate(flashcardForm);
  };

  const filteredCards = flashcards?.filter((card: Flashcard) => {
    return selectedSubject === "all" || !selectedSubject || card.subject === selectedSubject;
  }) || [];

  const studyCards = studyMode ? filteredCards : [];
  const currentCard = studyCards[currentCardIndex];

  const nextCard = () => {
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const markDifficulty = (difficulty: "easy" | "medium" | "hard") => {
    if (currentCard) {
      updateDifficultyMutation.mutate({ id: currentCard.id, difficulty });
      nextCard();
    }
  };

  const startStudySession = () => {
    if (filteredCards.length > 0) {
      setStudyMode(true);
      setCurrentCardIndex(0);
      setShowAnswer(false);
    }
  };

  const endStudySession = () => {
    setStudyMode(false);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  if (studyMode && studyCards.length > 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Study Session</h1>
            <p className="text-slate-600">
              Card {currentCardIndex + 1} of {studyCards.length}
            </p>
          </div>

          <Card className="min-h-[400px] flex flex-col">
            <CardContent className="flex-1 flex flex-col justify-center items-center p-8">
              <div className="text-center mb-6">
                <div className="text-lg font-medium text-slate-800 mb-4">
                  {showAnswer ? "Answer:" : "Question:"}
                </div>
                <div className="text-xl text-slate-700 min-h-[100px] flex items-center justify-center">
                  {showAnswer ? currentCard.back : currentCard.front}
                </div>
              </div>

              {!showAnswer ? (
                <Button onClick={() => setShowAnswer(true)} size="lg">
                  Show Answer
                </Button>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-sm text-slate-600">How difficult was this?</p>
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => markDifficulty("easy")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Easy
                    </Button>
                    <Button 
                      onClick={() => markDifficulty("medium")}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Medium
                    </Button>
                    <Button 
                      onClick={() => markDifficulty("hard")}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Hard
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mt-6">
            <Button variant="outline" onClick={previousCard} disabled={currentCardIndex === 0}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <Button variant="outline" onClick={endStudySession}>
              End Session
            </Button>

            <Button variant="outline" onClick={nextCard} disabled={currentCardIndex === studyCards.length - 1}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {currentCardIndex === studyCards.length - 1 && showAnswer && (
            <div className="text-center mt-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <p className="text-green-800 font-medium">🎉 Study session complete!</p>
                  <p className="text-green-600 text-sm">Great job reviewing your flashcards!</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Flashcards</h1>
            <p className="text-lg text-slate-600">Study with spaced repetition</p>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={startStudySession} disabled={filteredCards.length === 0}>
              <Brain className="w-4 h-4 mr-2" />
              Study ({filteredCards.length} cards)
            </Button>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Card
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Flashcard</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Front (Question)</label>
                    <Textarea
                      placeholder="Enter the question or prompt..."
                      value={flashcardForm.front}
                      onChange={(e) => setFlashcardForm({ ...flashcardForm, front: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Back (Answer)</label>
                    <Textarea
                      placeholder="Enter the answer..."
                      value={flashcardForm.back}
                      onChange={(e) => setFlashcardForm({ ...flashcardForm, back: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={flashcardForm.subject} onValueChange={(value) => setFlashcardForm({ ...flashcardForm, subject: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={flashcardForm.difficulty} onValueChange={(value) => setFlashcardForm({ ...flashcardForm, difficulty: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createFlashcardMutation.isPending}>
                      Create Card
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Subject Filter */}
        <div className="mb-6">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Flashcards Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading flashcards...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No flashcards found</h3>
            <p className="text-slate-600 mb-4">
              {selectedSubject ? "No cards for this subject." : "Create your first flashcard to start studying!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card: Flashcard) => (
              <Card key={card.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex space-x-2">
                      {card.subject && (
                        <Badge variant="outline">{card.subject}</Badge>
                      )}
                      <Badge className={difficultyColors[card.difficulty]}>
                        {card.difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Question:</p>
                      <p className="text-slate-600 text-sm line-clamp-3">{card.front}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Answer:</p>
                      <p className="text-slate-600 text-sm line-clamp-3">{card.back}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}