import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StudyTimerProps {
  onClose: () => void;
}

export default function StudyTimer({ onClose }: StudyTimerProps) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [initialMinutes, setInitialMinutes] = useState(25);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveStudySessionMutation = useMutation({
    mutationFn: async (duration: number) => {
      return apiRequest('POST', '/api/study-sessions', { duration });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-time/total'] });
      toast({ title: "Study session saved!" });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsRunning(false);
            const studiedMinutes = initialMinutes;
            saveStudySessionMutation.mutate(studiedMinutes);
            toast({ 
              title: "Study session complete! Time for a break.",
              description: `You studied for ${studiedMinutes} minutes.`
            });
            return;
          }
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, minutes, seconds, initialMinutes, saveStudySessionMutation, toast]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMinutes(25);
    setSeconds(0);
    setInitialMinutes(25);
  };

  const handleStop = () => {
    if (isRunning || minutes !== initialMinutes || seconds !== 0) {
      const studiedMinutes = initialMinutes - minutes - (seconds > 0 ? 0 : 1);
      if (studiedMinutes > 0) {
        saveStudySessionMutation.mutate(studiedMinutes);
      }
    }
    setIsRunning(false);
    setMinutes(25);
    setSeconds(0);
    setInitialMinutes(25);
  };

  const formatTime = (m: number, s: number) => {
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-50">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-700">Study Timer</h3>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {formatTime(minutes, seconds)}
            </div>
            <div className="text-xs text-slate-600">
              {isRunning ? 'Running' : 'Paused'}
            </div>
          </div>
          
          <div className="flex space-x-2">
            {!isRunning ? (
              <Button size="sm" variant="outline" onClick={handleStart}>
                <Play className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={handlePause}>
                <Pause className="w-4 h-4" />
              </Button>
            )}
            
            <Button size="sm" variant="outline" onClick={handleReset}>
              <Square className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="mt-3 flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              setMinutes(15);
              setSeconds(0);
              setInitialMinutes(15);
              setIsRunning(false);
            }}
            className="text-xs"
          >
            15m
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              setMinutes(25);
              setSeconds(0);
              setInitialMinutes(25);
              setIsRunning(false);
            }}
            className="text-xs"
          >
            25m
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              setMinutes(45);
              setSeconds(0);
              setInitialMinutes(45);
              setIsRunning(false);
            }}
            className="text-xs"
          >
            45m
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
