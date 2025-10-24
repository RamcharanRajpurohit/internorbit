import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SavedInternships from "./pages/SavedInternships";
import Applications from "./pages/Applications";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-pulse text-2xl text-primary">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes (Public) */}
          <Route path="/auth" element={<Index />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Main Routes (Public - No Protection) */}
          <Route path="/" element={<Index />} />

          {/* Protected Routes */}
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedInternships />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <Applications />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<Index />} />

          {/* Company Routes */}
          <Route path="/company" element={<Index />} />
          <Route path="/company/internships" element={<Index />} />
          <Route path="/company/internships/new" element={<Index />} />
          <Route path="/company/applicants" element={<Index />} />
          <Route path="/company/profile" element={<Index />} />

          {/* Detail Pages */}
          <Route path="/internship/:id" element={<Index />} />
          <Route path="/applications/new" element={<Index />} />

          {/* Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;