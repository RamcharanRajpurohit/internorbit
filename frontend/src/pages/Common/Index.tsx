import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRouteRefresh } from "@/hooks/useRouteRefresh";
import StudentDashboard from "../Student/StudentDashboard";
import CompanyDashboard from "../Company/CompanyDashboard";
import Landing from "./Landing";
import { Loader } from "@/components/ui/Loader";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading, isAuthenticated, isStudent, isCompany } = useAuth();

  // Detect browser refresh and refetch route data
  const userRole = isStudent ? 'student' : isCompany ? 'company' : null;
  useRouteRefresh(userRole);

  // Debug logging (only log when auth state changes)
  useEffect(() => {
    console.log('🔍 Index Component Debug:', {
      user: user ? `${user.email} (${user.role})` : null,
      isAuthenticated,
      isStudent,
      isCompany,
      authLoading,
      pathname: location.pathname
    });
  }, [user, isAuthenticated, isStudent, isCompany, authLoading]);

  // Redirect logic moved to App.tsx routing

  // Loading state
  if (authLoading) {
    return (
     <div className="min-h-screen flex items-center justify-center ">
        <Loader/>
      </div>
    );
  }

  // Special routes - now handled in App.tsx routing

  // Authenticated user - show dashboard based on role
  if (isAuthenticated && user) {
    console.log('✅ User is authenticated, showing dashboard');
    if (isStudent) {
      return <StudentDashboard />;
    }
    if (isCompany) {
      return <CompanyDashboard />;
    }
  } else {
    console.log('❌ User is not authenticated or user data missing', {
      isAuthenticated,
      user: !!user,
      isStudent,
      isCompany
    });
  }

  // No user or not authenticated - show landing page
  console.log('🏠 Showing landing page (not authenticated)');
  return <Landing />;
};

export default Index;