// frontend/src/App.tsx - UPDATED WITH ALL NEW ROUTES
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";

// Existing Pages
import Index from "./pages/Common/Index";
import Auth from "./pages/Common/Auth";
import AuthCallback from "./pages/Common/AuthCallback";
import NotFound from "./pages/Common/NotFound";
import StudentProfile from "./pages/Student/Profile/StudentProfile";
import SavedInternships from "./pages/Student/SavedInternships";
import Applications from "./pages/Student/Applications";
import CompanyProfile from "./pages/Company/CompanyProfile";
import CompanyInternships from "./pages/Company/CompanyInternships";
import CreateInternship from "./pages/Company/CreateInternship";
import CompanyApplicants from "./pages/Company/CompanyApplicants";
import ApplicationDetail from "./pages/Company/ApplicationDetail";

// NEW PAGES
import InternshipDetail from "./pages/Student/InternshipDetail";
import ApplyInternship from "./pages/Student/ApplyInternship";
import Search from "./pages/Common/Search";
import Settings from "./pages/Common/Settings";
import Notifications from "./pages/Common/Notifications";
import Help from "./pages/Common/Help";
import Contact from "./pages/Common/Contact";
import Onboarding from "./pages/Common/Onboarding";
import CompanyPublicProfile from "./pages/Company/CompanyPublicProfile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

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
          <Route path="/applications/:id" element={<ApplicationDetail />} />
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
    </PersistGate>
  </Provider>
);

export default App;