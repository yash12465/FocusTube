import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, PlayCircle, Clock, FileText } from 'lucide-react';
import { Video } from '@/types/video';

interface TranscriptSearchProps {
  video: Video;
}

interface TranscriptSegment {
  timestamp: string;
  text: string;
  confidence: number;
}

interface SearchResult {
  segments: TranscriptSegment[];
  totalMatches: number;
  searchQuery: string;
}

export function AITranscriptSearch({ video }: TranscriptSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      // Simulate API call for transcript search
      // In real implementation, this would call your AI service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock search results - in real implementation, this would come from AI processing
      const mockResults: SearchResult = {
        searchQuery,
        totalMatches: 3,
        segments: [
          {
            timestamp: "2:15",
            text: `This concept relates to ${searchQuery} which is fundamental to understanding the broader topic. Let me explain how this works in practice.`,
            confidence: 0.95
          },
          {
            timestamp: "7:42",
            text: `When we apply ${searchQuery} to real-world scenarios, we see significant improvements in efficiency and understanding.`,
            confidence: 0.88
          },
          {
            timestamp: "12:30",
            text: `The key takeaway about ${searchQuery} is that it provides a framework for approaching complex problems systematically.`,
            confidence: 0.92
          }
        ]
      };

      setSearchResults(mockResults);
    } catch (err) {
      setError('Failed to search transcript. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const jumpToTimestamp = (timestamp: string) => {
    // In real implementation, this would seek the video player to the specific time
    console.log(`Jumping to ${timestamp} in video ${video.id}`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Searchable Video Transcript
          </CardTitle>
          <CardDescription>
            Find specific concepts, terms, or explanations within the video content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search for concepts, keywords, or explanations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {searchResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results</span>
              <Badge variant="secondary">
                {searchResults.totalMatches} matches found
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.segments.map((segment, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-primary">{segment.timestamp}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(segment.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => jumpToTimestamp(segment.timestamp)}
                        className="flex items-center gap-1"
                      >
                        <PlayCircle className="w-3 h-3" />
                        Jump to
                      </Button>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {segment.text}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!searchResults && !isSearching && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-muted-foreground mb-2">
              Search Within Video Content
            </h3>
            <p className="text-sm text-muted-foreground">
              Enter a search term above to find specific concepts or explanations within this video's transcript
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}