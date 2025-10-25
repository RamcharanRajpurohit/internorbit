// frontend/src/App.tsx - UPDATED WITH ALL NEW ROUTES
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Existing Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentProfile from "./pages/StudentProfile";
import SavedInternships from "./pages/SavedInternships";
import Applications from "./pages/Applications";
import CompanyProfile from "./pages/CompanyProfile";
import CompanyInternships from "./pages/CompanyInternships";
import CreateInternship from "./pages/CreateInternship";
import CompanyApplicants from "./pages/CompanyApplicants";

// NEW PAGES
import InternshipDetail from "./pages/InternshipDetail";
import ApplyInternship from "./pages/ApplyInternship";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import Onboarding from "./pages/Onboarding";
import CompanyPublicProfile from "./pages/CompanyPublicProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Index />} />
          <Route path="/auth/callback" element={<Index />} />

          {/* NEW: Onboarding */}
          <Route path="/onboarding" element={<Onboarding userRole="student" />} />
          <Route path="/onboarding/company" element={<Onboarding userRole="company" />} />

          {/* NEW: Internship Detail & Apply */}
          <Route path="/internship/:id" element={<InternshipDetail />} />
          <Route path="/apply/:id" element={<ApplyInternship />} />

          {/* NEW: Search & Explore */}
          <Route path="/search" element={<Search />} />
          <Route path="/explore" element={<Search />} />

          {/* Student Routes */}
          <Route path="/saved" element={<SavedInternships />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/profile" element={<StudentProfile />} />

          {/* Company Routes */}
          <Route path="/company" element={<Index />} />
          <Route path="/company/profile" element={<CompanyProfile />} />
          <Route path="/company/internships" element={<CompanyInternships />} />
          <Route path="/company/internships/new" element={<CreateInternship />} />
          <Route path="/company/internships/:id/edit" element={<CreateInternship />} />
          <Route path="/company/applicants" element={<CompanyApplicants />} />

          {/* NEW: Company Public Profile */}
          <Route path="/company/:id/public" element={<CompanyPublicProfile />} />

          {/* NEW: Settings & Account */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/account" element={<Settings />} />
          <Route path="/settings/notifications" element={<Settings />} />
          <Route path="/settings/security" element={<Settings />} />

          {/* NEW: Notifications */}
          <Route path="/notifications" element={<Notifications />} />

          {/* NEW: Help & Support */}
          <Route path="/help" element={<Help />} />
          <Route path="/faq" element={<Help />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<Contact />} />

          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;