import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Notes from "@/pages/notes";
import Tasks from "@/pages/tasks";
import Flashcards from "@/pages/flashcards";
import Schedule from "@/pages/schedule";
import AIFeatures from "@/pages/ai-features";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/notes" component={Notes} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/flashcards" component={Flashcards} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/ai-features" component={AIFeatures} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
