import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { useEffect, useState } from "react";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";

// Pages
import Home from "@/pages/home";
import Discover from "@/pages/discover";
import Messages from "@/pages/messages";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

// Components
import BottomNavigation from "@/components/BottomNavigation";
import Sidebar from "@/components/Sidebar";
import CreateButton from "@/components/CreateButton";
import OnboardingModal from "@/components/OnboardingModal";

function RouterContent() {
  const [location] = useLocation();
  const { collapsed } = useSidebar();
  
  const showNavigation = !["/login", "/register"].includes(location);
  const showCreateButton = showNavigation;
  
  // Calculate margin based on sidebar state
  const sidebarWidth = collapsed ? 'lg:ml-20' : 'lg:ml-64';
  
  return (
    <div className="flex min-h-screen bg-background">
      {showNavigation && <Sidebar />}
      
      <main className={`flex-1 ${showNavigation ? sidebarWidth : ''} min-h-screen pb-[60px] lg:pb-0 transition-all duration-300`}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/discover" component={Discover} />
          <Route path="/messages" component={Messages} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {showNavigation && <BottomNavigation />}
      {showCreateButton && <CreateButton />}
    </div>
  );
}

function Router() {
  return (
    <SidebarProvider>
      <RouterContent />
    </SidebarProvider>
  );
}

function App() {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if first visit
    const visited = localStorage.getItem('jobtok_visited');
    if (!visited) {
      setIsFirstVisit(true);
    }
  }, []);
  
  const handleOnboardingComplete = () => {
    localStorage.setItem('jobtok_visited', 'true');
    setIsFirstVisit(false);
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
      {isFirstVisit && <OnboardingModal onComplete={handleOnboardingComplete} />}
    </QueryClientProvider>
  );
}

export default App;
