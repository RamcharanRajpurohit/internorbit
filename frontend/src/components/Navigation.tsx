import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import React from "react";
import { Home, Briefcase, Heart, User, LogOut, Building, SidebarOpenIcon, SidebarCloseIcon } from "lucide-react";

interface NavigationProps {
  role: "student" | "company";
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const Navigation = ({ role ,isMenuOpen, setIsMenuOpen  }: NavigationProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  // const [isMenuOpen, setIsMenuOpen] = React.useState(false);
 


  return (
    <nav className="border-b  border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              InternOrbit
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={` md:flex items-center gap-1 ${isMenuOpen ? "flex" : "hidden"}`}>
              <div className={`${isMenuOpen ? "fixed h-screen w-2/5 top-16 " : "auto"}   bg-gray-200 left-0 bg-card p-4  shadow-lg md:shadow-none md:p-0 md:bg-transparent`}>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                  {role === "student" ? (
                    <div className={`${isMenuOpen ? "flex flex-col items-start gap-2 w-full" : "flex items-baseline gap-1"}`}>
                      <Button variant="ghost" onClick={() => navigate("/")} >
                        <Home className="w-4 h-4 mr-1" />
                        Discover
                      </Button>
                      <Button variant="ghost" onClick={() => navigate("/saved")}>
                        <Heart className="w-4 h-4 mr-1" />
                        Saved
                      </Button>
                      <Button variant="ghost" onClick={() => navigate("/applications")}>
                        <Briefcase className="w-4 h-4 mr-1" />
                        Applications
                      </Button>
                      <Button variant="ghost" onClick={() => navigate("/profile")}>
                        <User className="w-4 h-4 mr-1" />
                        Profile
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={`${isMenuOpen ? "flex flex-col gap-2 w-full" : "flex items-center gap-1"}`}>
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
                    </div>
                  )}
                  <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="md:hidden">
              {
                !isMenuOpen ? (
                  <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost">
                    <SidebarOpenIcon className="w-5 h-5" />
                  </Button>) : (
                  <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost">
                    <SidebarCloseIcon className="w-5 h-5" />
                  </Button>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;