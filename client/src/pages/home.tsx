import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VideoCard from "@/components/video-card";
import VideoModal from "@/components/video-modal";
import SearchFiltersComponent from "@/components/search-filters";
import { Video, SearchFilters } from "@/types/video";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [filters, setFilters] = useState<SearchFilters>({
    subject: "",
    duration: "",
    level: "",
    channels: [],
  });

  // Fetch trending videos by default
  const { data: trendingData, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['/api/videos/trending'],
    enabled: !searchQuery && !selectedSubject,
  });

  // Search videos when query or filters change
  const { data: searchData, isLoading: isLoadingSearch, refetch: searchVideos } = useQuery({
    queryKey: ['/api/videos/search', searchQuery, selectedSubject, filters],
    enabled: false,
  });

  const handleSearch = () => {
    if (searchQuery || selectedSubject || filters.duration || filters.level || filters.channels.length > 0) {
      searchVideos();
    }
  };

  // Auto-search when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      handleSearch();
    }
  }, [selectedSubject]);

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const videos = searchData?.videos || trendingData?.videos || [];
  const isLoading = isLoadingTrending || isLoadingSearch;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 p-4">
          <SearchFiltersComponent 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            filters={filters}
            setFilters={setFilters}
            onSearch={handleSearch}
          />
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {selectedSubject || searchQuery ? 
                    `${selectedSubject || 'Search'} Videos` : 
                    'Trending Educational Videos'
                  }
                </h2>
                <p className="text-slate-600 mt-1">
                  {isLoading ? 'Loading...' : `Showing ${videos.length} educational videos`}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Most Relevant</SelectItem>
                    <SelectItem value="viewCount">Most Viewed</SelectItem>
                    <SelectItem value="date">Most Recent</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Video Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-slate-800 mb-2">No videos found</h3>
                <p className="text-slate-600">
                  {searchQuery || selectedSubject ? 
                    'Try adjusting your search terms or filters.' :
                    'Unable to load trending videos. Please check your internet connection.'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onPlay={handlePlayVideo}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                <div className="text-center mt-8">
                  <Button 
                    onClick={handleSearch}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium"
                  >
                    Load More Videos
                  </Button>
                </div>
              </>
            )}
          </div>
        </main>
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
