import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRouteRefresh } from "@/hooks/useRouteRefresh";
import StudentDashboard from "../Student/StudentDashboard";
import CompanyDashboard from "../Company/CompanyDashboard";
import Landing from "./Landing";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading, isAuthenticated, isStudent, isCompany } = useAuth();
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  // Detect browser refresh and refetch route data
  const userRole = isStudent ? 'student' : isCompany ? 'company' : null;
  useRouteRefresh(userRole);

  // Redirect to onboarding for first-time users ONLY
  useEffect(() => {
    // Prevent multiple redirects
    if (hasCheckedOnboarding) return;
    
    if (isAuthenticated && user && !authLoading) {
      const profileCompleted = user.profile_completed || user.profile_complete;
      const onboardingCompleted = user.onboarding_completed;
      
      // ONLY redirect if:
      // 1. onboarding_completed is EXPLICITLY false (new user)
      // 2. AND profile is not complete
      // 3. AND not already on an onboarding page
      const isOnOnboardingPage = location.pathname.includes('/onboarding');
      
      if (onboardingCompleted === false && !profileCompleted && !isOnOnboardingPage) {
        setHasCheckedOnboarding(true);
        if (isStudent) {
          navigate('/onboarding', { replace: true });
        } else if (isCompany) {
          navigate('/onboarding/company', { replace: true });
        }
      } else {
        setHasCheckedOnboarding(true);
      }
    }
  }, [isAuthenticated, user, authLoading, isStudent, isCompany, navigate, location.pathname, hasCheckedOnboarding]);

  // Show content immediately when auth check is done
  // Authenticated user - show dashboard based on role
  if (isAuthenticated && user) {
    if (isStudent) {
      return <StudentDashboard />;
    }
    if (isCompany) {
      return <CompanyDashboard />;
    }
  }

  // No user or not authenticated - show landing page (no loader)
  return <Landing />;
};

export default Index;