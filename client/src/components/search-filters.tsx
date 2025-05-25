import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, GraduationCap } from "lucide-react";
import { SearchFilters } from "@/types/video";

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  onSearch: () => void;
}

const subjects = [
  'Mathematics',
  'Science', 
  'History',
  'Programming',
  'Physics',
  'Chemistry',
  'Biology',
  'Competitive Exams'
];

const trustedChannels = [
  { id: 'UC_x5XG1OV2P6uZZ5FSM9Ttw', name: 'Khan Academy' },
  { id: 'UCEBb1b_L6zDS3xTUrIALZOw', name: 'MIT OpenCourseWare' },
  { id: 'UC7cs8q-gJRlGwj4A8OmCmXg', name: 'Unacademy' },
  { id: 'UCzvQcsABBjsoaexHiQTbh_A', name: 'Gate Smashers' },
];

export default function SearchFiltersComponent({ 
  searchQuery, 
  setSearchQuery, 
  selectedSubject, 
  setSelectedSubject,
  filters,
  setFilters,
  onSearch 
}: SearchFiltersProps) {
  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="text-2xl text-primary" />
                <h1 className="text-2xl font-bold text-slate-800">FocusTube</h1>
              </div>
              <span className="hidden sm:block text-sm text-slate-600 font-medium">Distraction-Free Learning</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/dashboard" className="text-slate-600 hover:text-primary transition-colors">Dashboard</a>
              <a href="/notes" className="text-slate-600 hover:text-primary transition-colors">Notes</a>
              <a href="/tasks" className="text-slate-600 hover:text-primary transition-colors">Tasks</a>
              <a href="/flashcards" className="text-slate-600 hover:text-primary transition-colors">Flashcards</a>
              <a href="/schedule" className="text-slate-600 hover:text-primary transition-colors">Schedule</a>
            </nav>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full">
                <span className="text-sm font-medium text-slate-700">2h 15m</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Focus on Learning</h2>
              <p className="text-lg text-slate-600">Educational videos without distractions</p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-slate-400" />
              </div>
              <Input 
                type="text" 
                placeholder="Search educational topics, concepts, or subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                className="w-full pl-12 pr-4 py-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Subject Filters */}
            <div className="flex flex-wrap gap-3 justify-center">
              {subjects.map((subject) => (
                <Button
                  key={subject}
                  variant={selectedSubject === subject ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedSubject(selectedSubject === subject ? '' : subject);
                    setFilters({ ...filters, subject: selectedSubject === subject ? '' : subject });
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedSubject === subject 
                      ? 'bg-primary text-white hover:bg-secondary' 
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {subject}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
