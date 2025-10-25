import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import StudentDashboard from "./StudentDashboard";
import CompanyDashboard from "./CompanyDashboard";
import Landing from "./Landing";
import Auth from "./Auth";
import AuthCallback from "./AuthCallback";

const API_URL = import.meta.env.VITE_API_URI;

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (session?.user) {
          setUser(session.user);

          // Fetch profile from backend
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });

          if (response.ok) {
            const { user: profileData } = await response.json();
            localStorage.setItem('userId', JSON.stringify(profileData._id));
            setProfile(profileData);
          } else {
            console.warn("Profile fetch failed, redirecting to auth");
            setUser(null);
            setProfile(null);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);

          // Fetch profile after sign in
          try {
            const response = await fetch(`${API_URL}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
              },
            });

            if (response.ok) {
              const { user: profileData } = await response.json();
              localStorage.setItem('userId', JSON.stringify(profileData._id));
              setProfile(profileData);
            }
          } catch (err) {
            console.error('Profile fetch error:', err);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          localStorage.removeItem('userId');
          navigate('/auth');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-pulse text-2xl text-primary">Loading...</div>
      </div>
    );
  }

  // Special routes (always accessible)
  if (location.pathname === "/auth/callback") {
    return <AuthCallback />;
  }

  if (location.pathname === "/auth") {
    // If user is already logged in and has profile, redirect to dashboard
    if (user && profile) {
      navigate("/");
      return null;
    }
    return <Auth />;
  }

  // Authenticated user with profile - show dashboard
  if (user && profile) {
    if (profile.role === "student") {
      return <StudentDashboard />;
    }
    return <CompanyDashboard />;
  }

  // No user or no profile - show landing page
  return <Landing />;
};

export default Index;