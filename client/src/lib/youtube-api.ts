import { Video } from "@/types/video";

export const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1]?.replace('H', '') || '0');
  const minutes = parseInt(match[2]?.replace('M', '') || '0');
  const seconds = parseInt(match[3]?.replace('S', '') || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const formatViewCount = (count: string): string => {
  const num = parseInt(count);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return count;
};

export const getSubjectColor = (subject: string): string => {
  const colors: Record<string, string> = {
    'Mathematics': 'bg-blue-100 text-blue-700',
    'Math': 'bg-blue-100 text-blue-700',
    'Science': 'bg-green-100 text-green-700',
    'Physics': 'bg-purple-100 text-purple-700',
    'Chemistry': 'bg-yellow-100 text-yellow-700',
    'History': 'bg-red-100 text-red-700',
    'Programming': 'bg-indigo-100 text-indigo-700',
    'Coding': 'bg-indigo-100 text-indigo-700',
    'Biology': 'bg-emerald-100 text-emerald-700',
    'Competitive Exams': 'bg-orange-100 text-orange-700',
  };
  return colors[subject] || 'bg-gray-100 text-gray-700';
};

export const getLevelColor = (level: string): string => {
  const colors: Record<string, string> = {
    'Beginner': 'bg-green-100 text-green-700',
    'Intermediate': 'bg-yellow-100 text-yellow-700',
    'Advanced': 'bg-red-100 text-red-700',
  };
  return colors[level] || 'bg-gray-100 text-gray-700';
};
