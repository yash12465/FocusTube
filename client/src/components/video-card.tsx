import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Play } from "lucide-react";
import { Video } from "@/types/video";
import { formatDuration, formatViewCount, getSubjectColor, getLevelColor } from "@/lib/youtube-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
}

export default function VideoCard({ video, onPlay }: VideoCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if video is bookmarked
  const { data: bookmarkStatus } = useQuery({
    queryKey: [`/api/bookmarks/${video.id}/status`],
  });

  const addBookmarkMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/bookmarks', {
        videoId: video.id,
        title: video.title,
        channel: video.channel,
        duration: formatDuration(video.duration),
        thumbnail: video.thumbnail,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      queryClient.invalidateQueries({ queryKey: [`/api/bookmarks/${video.id}/status`] });
      toast({ title: "Video bookmarked successfully" });
    },
    onError: () => {
      toast({ title: "Failed to bookmark video", variant: "destructive" });
    },
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/bookmarks/${video.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      queryClient.invalidateQueries({ queryKey: [`/api/bookmarks/${video.id}/status`] });
      toast({ title: "Bookmark removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove bookmark", variant: "destructive" });
    },
  });

  const handleBookmarkToggle = () => {
    if (bookmarkStatus?.isBookmarked) {
      removeBookmarkMutation.mutate();
    } else {
      addBookmarkMutation.mutate();
    }
  };

  // Determine subject and level from title/description for badge display
  const getSubjectFromTitle = (title: string): string => {
    const subjects = ['Mathematics', 'Math', 'Science', 'Physics', 'Chemistry', 'History', 'Programming', 'Biology'];
    const foundSubject = subjects.find(subject => 
      title.toLowerCase().includes(subject.toLowerCase())
    );
    return foundSubject || 'Education';
  };

  const getLevelFromTitle = (title: string): string => {
    if (title.toLowerCase().includes('beginner') || title.toLowerCase().includes('basic')) return 'Beginner';
    if (title.toLowerCase().includes('advanced')) return 'Advanced';
    return 'Intermediate';
  };

  const subject = getSubjectFromTitle(video.title);
  const level = getLevelFromTitle(video.title);

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {formatDuration(video.duration)}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="absolute top-2 right-2 p-2 bg-white bg-opacity-90 hover:bg-opacity-100"
          onClick={handleBookmarkToggle}
          disabled={addBookmarkMutation.isPending || removeBookmarkMutation.isPending}
        >
          <Bookmark 
            className={`w-4 h-4 ${
              bookmarkStatus?.isBookmarked 
                ? 'fill-current text-accent' 
                : 'text-slate-600'
            }`} 
          />
        </Button>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2">
          {video.title}
        </h3>
        <p className="text-sm text-slate-600 mb-3">
          {video.channel} • {formatViewCount(video.viewCount)} views
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className={getSubjectColor(subject)}>
              {subject}
            </Badge>
            <Badge variant="secondary" className={getLevelColor(level)}>
              {level}
            </Badge>
          </div>
          <Button 
            size="sm"
            onClick={() => onPlay(video)}
            className="text-primary hover:text-secondary"
          >
            Watch Now <Play className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
