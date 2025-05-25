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
    enabled: !searchQuery && !selectedSubject && !filters.duration && !filters.level && filters.channels.length === 0,
  });

  // Build search query parameters
  const buildSearchParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedSubject) params.append('subject', selectedSubject);
    if (filters.duration) params.append('duration', filters.duration);
    if (filters.level) params.append('level', filters.level);
    if (filters.channels.length > 0) params.append('channels', filters.channels.join(','));
    return params.toString();
  };

  // Search videos when query or filters change
  const shouldSearch = !!(searchQuery || selectedSubject || filters.duration || filters.level || filters.channels.length > 0);
  const { data: searchData, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['/api/videos/search', buildSearchParams()],
    queryFn: () => fetch(`/api/videos/search?${buildSearchParams()}`).then(res => res.json()),
    enabled: shouldSearch,
  });

  const handleSearch = () => {
    // The search will automatically trigger due to the query key changes
  };

  // Auto-search when subject is selected
  useEffect(() => {
    // Search will automatically trigger when selectedSubject changes due to query key dependency
  }, [selectedSubject]);

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const videos = (searchData as any)?.videos || (trendingData as any)?.videos || [];
  const isLoading = isLoadingTrending || isLoadingSearch;

  return (
    <div className="min-h-screen bg-slate-50">
      <SearchFiltersComponent 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        filters={filters}
        setFilters={setFilters}
        onSearch={handleSearch}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Filters</h3>
              
              {/* Duration Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Duration</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="short" 
                      name="duration" 
                      value="short"
                      checked={filters.duration === 'short'}
                      onChange={(e) => setFilters({ ...filters, duration: e.target.value as any })}
                    />
                    <label htmlFor="short" className="text-sm text-slate-600">Short (under 10 min)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="medium" 
                      name="duration" 
                      value="medium"
                      checked={filters.duration === 'medium'}
                      onChange={(e) => setFilters({ ...filters, duration: e.target.value as any })}
                    />
                    <label htmlFor="medium" className="text-sm text-slate-600">Medium (10-30 min)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="long" 
                      name="duration" 
                      value="long"
                      checked={filters.duration === 'long'}
                      onChange={(e) => setFilters({ ...filters, duration: e.target.value as any })}
                    />
                    <label htmlFor="long" className="text-sm text-slate-600">Long (30+ min)</label>
                  </div>
                </div>
              </div>

              {/* Level Filter */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">Level</h4>
                <div className="space-y-2">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id={level}
                        checked={filters.level === level}
                        onChange={(e) => 
                          setFilters({ ...filters, level: e.target.checked ? level as any : '' })
                        }
                      />
                      <label htmlFor={level} className="text-sm text-slate-600 capitalize">
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
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
                  {videos.map((video: Video) => (
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
          </main>
        </div>
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