import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VideoCard from "@/components/video-card";
import VideoModal from "@/components/video-modal";
import { Video } from "@/types/video";
import { Search, Loader2, Play } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch trending videos by default
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['/api/videos/trending'],
    enabled: !searchQuery && (!selectedSubject || selectedSubject === "all"),
  });

  // Search videos with query parameters
  const searchParams = new URLSearchParams();
  if (searchQuery) searchParams.append('q', searchQuery);
  if (selectedSubject && selectedSubject !== "all") searchParams.append('subject', selectedSubject);
  
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['/api/videos/search', searchParams.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/videos/search?${searchParams.toString()}`);
      return response.json();
    },
    enabled: !!(searchQuery || (selectedSubject && selectedSubject !== "all")),
  });

  const handleSearch = () => {
    // Search will automatically trigger due to query key changes
  };

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  // Get videos from either search results or trending
  const videos: Video[] = (searchData as any)?.videos || (trendingData as any)?.videos || [];
  const isLoading = trendingLoading || searchLoading;

  const subjects = [
    "Mathematics", "Science", "Physics", "Chemistry", "Biology",
    "Computer Science", "Programming", "History", "Geography",
    "Literature", "Languages", "Art", "Music", "Philosophy"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📚 FocusTube - Educational Videos
            </h1>
            <p className="text-lg text-gray-600">
              Discover curated educational content from trusted sources
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for educational videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-3 text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full md:w-64 py-3">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject.toLowerCase()}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleSearch}
                className="px-8 py-3 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {searchQuery || selectedSubject ? 
              `Search Results${selectedSubject ? ` - ${selectedSubject}` : ''}` : 
              'Trending Educational Videos'
            }
          </h2>
          <p className="text-gray-600">
            {isLoading ? 'Loading videos...' : `Found ${videos.length} educational videos`}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-lg text-gray-600">Loading educational videos...</p>
            </div>
          </div>
        )}

        {/* No Videos State */}
        {!isLoading && videos.length === 0 && (
          <div className="text-center py-20">
            <div className="mb-6">
              <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Videos Found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchQuery || selectedSubject ? 
                  'Try adjusting your search terms or selecting a different subject.' :
                  'Unable to load trending videos at the moment. Please try again later.'
                }
              </p>
            </div>
            {(searchQuery || (selectedSubject && selectedSubject !== "all")) && (
              <Button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSubject("all");
                }}
                variant="outline"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Videos Grid */}
        {!isLoading && videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video: Video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={handlePlayVideo}
              />
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      <VideoModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}