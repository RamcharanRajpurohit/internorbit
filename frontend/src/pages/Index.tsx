import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import StudentDashboard from "./StudentDashboard";
import CompanyDashboard from "./CompanyDashboard";
import Landing from "./Landing";
import Auth from "./Auth";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkAuth().catch((err) => {
      console.error("Auth check failed:", err);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            setUser(session.user);
            await loadProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
          }
        } catch (err) {
          console.error("Error during auth state change:", err);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      const session = data?.session;

      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      }
    } catch (err) {
      console.error("checkAuth failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId: string) => {
    // const { data, error } = await supabase
    //   .from("profiles")
    //   .select("*")
    //   .eq("id", userId)
    //   .single();

    // if (error) {
    //   console.error("Failed to load profile:", error);
    //   throw error; // you can remove this if you only want to log
    // }
    const  data = {}

    if (data) {
      setProfile(data);
    } else {
      console.warn("Profile not found for user:", userId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-pulse text-2xl text-primary">Loading...</div>
      </div>
    );
  }

  if (user && profile) {
    if (location.pathname === "/auth") {
      navigate("/");
      return null;
    }

    if (profile.role === "student") return <StudentDashboard />;
    return <CompanyDashboard />;
  }

  if (location.pathname === "/auth") {
    return <Auth />;
  }

  return <Landing />;
};

export default Index;
