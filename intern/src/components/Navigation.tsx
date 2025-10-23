import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Home, Briefcase, Heart, User, LogOut, Building } from "lucide-react";

interface NavigationProps {
  role: "student" | "company";
}

const Navigation = ({ role }: NavigationProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              InternMatch
            </span>
          </div>

          <div className="flex items-center gap-2">
            {role === "student" ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/")}>
                  <Home className="w-4 h-4 mr-2" />
                  Discover
                </Button>
                <Button variant="ghost" onClick={() => navigate("/saved")}>
                  <Heart className="w-4 h-4 mr-2" />
                  Saved
                </Button>
                <Button variant="ghost" onClick={() => navigate("/applications")}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Applications
                </Button>
                <Button variant="ghost" onClick={() => navigate("/profile")}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/company")}>
                  <Building className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => navigate("/company/internships")}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Internships
                </Button>
                <Button variant="ghost" onClick={() => navigate("/company/profile")}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;