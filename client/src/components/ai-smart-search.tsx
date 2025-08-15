import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Search, Brain } from 'lucide-react';
import { getAIRecommendations, AIRecommendationResponse } from '@/lib/ai-api';
import { useToast } from '@/hooks/use-toast';

interface AISmartSearchProps {
  onSearch: (query: string) => void;
  currentSubject?: string;
}

export function AISmartSearch({ onSearch, currentSubject }: AISmartSearchProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AIRecommendationResponse | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  const handleAISearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a topic to get AI recommendations",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const recommendations = await getAIRecommendations({
        query: query.trim(),
        subject: currentSubject,
        userLevel: 'intermediate' // Could be dynamic based on user profile
      });

      setAiSuggestions(recommendations);
      setShowSuggestions(true);
      
      toast({
        title: "AI Recommendations Ready",
        description: "I've found some great educational content suggestions for you!"
      });
    } catch (error) {
      console.error('AI Search Error:', error);
      toast({
        title: "AI Search Failed",
        description: "Couldn't get AI recommendations. Please try again or use regular search.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSearch(suggestion);
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleRegularSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRegularSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Search Input Section */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="What would you like to learn today?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-12 h-12 text-lg border-2 border-slate-200 focus:border-primary rounded-xl"
          />
          <Search className="absolute right-3 top-3 h-6 w-6 text-slate-400" />
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleRegularSearch}
            disabled={!query.trim()}
            className="h-12 px-6 bg-primary hover:bg-primary/90 rounded-xl"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          
          <Button
            onClick={handleAISearch}
            disabled={!query.trim() || isLoading}
            variant="outline"
            className="h-12 px-6 border-2 border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            AI Suggest
          </Button>
        </div>
      </div>

      {/* AI Suggestions Panel */}
      {showSuggestions && aiSuggestions && (
        <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Sparkles className="w-5 h-5" />
              AI Recommendations
            </CardTitle>
            <CardDescription className="text-slate-600">
              {aiSuggestions.explanation}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Recommendations */}
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Recommended Topics:</h4>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.recommendations.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-purple-100 hover:text-purple-800 px-3 py-1 text-sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Alternative Search Terms */}
            {aiSuggestions.suggestedSearchTerms.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-800 mb-2">You might also like:</h4>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.suggestedSearchTerms.map((term, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 px-3 py-1 text-sm"
                      onClick={() => handleSuggestionClick(term)}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(false)}
              className="mt-2 text-slate-500 hover:text-slate-700"
            >
              Hide Suggestions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}