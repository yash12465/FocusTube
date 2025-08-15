import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SearchFiltersComponent from "@/components/search-filters";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Clock } from "lucide-react";

interface ScheduleItem {
  id: number;
  title: string;
  subject: string | null;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  color: string;
  createdAt: string;
}

export default function Schedule() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    subject: "all",
    startTime: "",
    endTime: "",
    dayOfWeek: 0,
    color: "#3B82F6",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const subjects = [
    "Mathematics", "Science", "History", "Programming", 
    "Physics", "Chemistry", "Biology", "English"
  ];

  const daysOfWeek = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  const colors = [
    "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
    "#8B5CF6", "#F97316", "#06B6D4", "#84CC16"
  ];

  // Fetch schedule items
  const { data: scheduleItems, isLoading } = useQuery({
    queryKey: ['/api/schedules'],
    select: (data: any) => data || []
  });

  // Create schedule item mutation
  const createScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      return apiRequest('POST', '/api/schedules', scheduleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      setIsCreateModalOpen(false);
      setScheduleForm({ title: "", subject: "all", startTime: "", endTime: "", dayOfWeek: 0, color: "#3B82F6" });
      toast({ title: "Schedule item created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create schedule item", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createScheduleMutation.mutate(scheduleForm);
  };

  // Group schedule items by day
  const scheduleByDay = daysOfWeek.map((day, index) => ({
    day,
    dayIndex: index,
    items: scheduleItems?.filter((item: ScheduleItem) => item.dayOfWeek === index) || []
  }));

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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Study Schedule</h1>
            <p className="text-lg text-slate-600">Plan your weekly study sessions</p>
          </div>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Study Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Session title..."
                    value={scheduleForm.title}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Select value={scheduleForm.subject} onValueChange={(value) => setScheduleForm({ ...scheduleForm, subject: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={scheduleForm.dayOfWeek.toString()} onValueChange={(value) => setScheduleForm({ ...scheduleForm, dayOfWeek: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day, index) => (
                        <SelectItem key={day} value={index.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Start Time</label>
                    <Input
                      type="time"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">End Time</label>
                    <Input
                      type="time"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Color</label>
                  <div className="flex space-x-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${scheduleForm.color === color ? 'border-slate-400' : 'border-slate-200'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setScheduleForm({ ...scheduleForm, color })}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createScheduleMutation.isPending}>
                    Create Session
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {scheduleByDay.map(({ day, dayIndex, items }) => (
            <Card key={day} className="min-h-[400px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-center">{day}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No sessions</p>
                  </div>
                ) : (
                  items
                    .sort((a: ScheduleItem, b: ScheduleItem) => a.startTime.localeCompare(b.startTime))
                    .map((item: ScheduleItem) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg text-white text-sm"
                        style={{ backgroundColor: item.color }}
                      >
                        <div className="font-medium mb-1">{item.title}</div>
                        {item.subject && (
                          <div className="text-xs opacity-90 mb-1">{item.subject}</div>
                        )}
                        <div className="flex items-center text-xs opacity-90">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.startTime} - {item.endTime}
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Study Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Study Schedule Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">📅 Consistency is Key</h4>
                <p className="text-blue-700 text-sm">Try to study at the same times each day to build a routine</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">⏰ Break It Down</h4>
                <p className="text-green-700 text-sm">Use 25-50 minute focused sessions with short breaks</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">🎯 Prioritize Subjects</h4>
                <p className="text-purple-700 text-sm">Schedule difficult subjects when your energy is highest</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}