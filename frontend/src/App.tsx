// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentProfile from "./pages/StudentProfile";
import SavedInternships from "./pages/SavedInternships";
import Applications from "./pages/Applications";
import CompanyProfile from "./pages/CompanyProfile";
import CompanyInternships from "./pages/CompanyInternships";
import CreateInternship from "./pages/CreateInternship";
import CompanyApplicants from "./pages/CompanyApplicants";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main landing/dashboard route */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Index />} />
          <Route path="/auth/callback" element={<Index />} />

          {/* Student Routes */}
          <Route path="/saved" element={<SavedInternships />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/profile" element={<StudentProfile />} />

          {/* Company Routes */}
          <Route path="/company" element={<Index />} />
          <Route path="/company/profile" element={<CompanyProfile />} />
          <Route path="/company/internships" element={<CompanyInternships />} />
          <Route path="/company/internships/new" element={<CreateInternship />} />
          <Route
            path="/company/internships/:id/edit"
            element={<CreateInternship />}
          />
          <Route path="/company/applicants" element={<CompanyApplicants />} />

          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;