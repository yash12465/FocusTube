import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Clock, X } from "lucide-react";
import { Video } from "@/types/video";
import { formatViewCount, getSubjectColor, getLevelColor } from "@/lib/youtube-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import StudyTimer from "./study-timer";
import { useState } from "react";

interface VideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ video, isOpen, onClose }: VideoModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTimer, setShowTimer] = useState(false);

  // Check if video is bookmarked
  const { data: bookmarkStatus } = useQuery({
    queryKey: [`/api/bookmarks/${video?.id}/status`],
    enabled: !!video && isOpen,
  });

  if (!video) return null;

  const addBookmarkMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/bookmarks', {
        videoId: video.id,
        title: video.title,
        channel: video.channel,
        duration: video.duration,
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

  // Determine subject and level from title for badge display
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

  const embedUrl = `https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1&showinfo=0&fs=1&controls=1`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="flex justify-between items-center p-4 border-b border-slate-200">
          <DialogTitle className="text-lg font-semibold text-slate-800 pr-8">
            {video.title}
          </DialogTitle>
          <div className="flex items-center space-x-4">
            <Button
              size="sm"
              variant="outline"
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
            <Button size="sm" variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="aspect-video bg-black">
          <iframe
            src={embedUrl}
            title={video.title}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                {video.channel} • {formatViewCount(video.viewCount)} views
              </span>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className={getSubjectColor(subject)}>
                  {subject}
                </Badge>
                <Badge variant="secondary" className={getLevelColor(level)}>
                  {level}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowTimer(!showTimer)}
              >
                <Clock className="w-4 h-4 mr-1" />
                Study Timer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
      
      {showTimer && <StudyTimer onClose={() => setShowTimer(false)} />}
    </Dialog>
  );
}
