import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Home, Briefcase, Heart, User, LogOut, Building, Menu, X, ChevronRight, Moon, Sun } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface NavigationProps {
  role: "student" | "company";
}

const Navigation = ({ role }: NavigationProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/");
      setIsMobileMenuOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to logout");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const NavItems = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex items-center gap-2'}`}>
      {role === "student" ? (
        <>
          {isMobile ? (
            <Button
              variant="ghost"
              onClick={() => handleNavigation("/")}
              className="justify-start w-full"
            >
              <Home className="w-4 h-4 mr-3" />
              Discover
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => navigate("/")}>
              <Home className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Discover</span>
            </Button>
          )}
          {isMobile ? (
            <Button
              variant="ghost"
              onClick={() => handleNavigation("/saved")}
              className="justify-start w-full"
            >
              <Heart className="w-4 h-4 mr-3" />
              Saved
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => navigate("/saved")}>
              <Heart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Saved</span>
            </Button>
          )}
          {isMobile ? (
            <Button
              variant="ghost"
              onClick={() => handleNavigation("/applications")}
              className="justify-start w-full"
            >
              <Briefcase className="w-4 h-4 mr-3" />
              Applications
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => navigate("/applications")}>
              <Briefcase className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Applications</span>
            </Button>
          )}
          {isMobile ? (
            <Button
              variant="ghost"
              onClick={() => handleNavigation("/profile")}
              className="justify-start w-full"
            >
              <User className="w-4 h-4 mr-3" />
              Profile
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => navigate("/profile")}>
              <User className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          )}
        </>
      ) : (
        <>
          {isMobile ? (
            <Button
              variant="ghost"
              onClick={() => handleNavigation("/company")}
              className="justify-start w-full"
            >
              <Building className="w-4 h-4 mr-3" />
              Dashboard
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => navigate("/company")}>
              <Building className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          )}
          {isMobile ? (
            <Button
              variant="ghost"
              onClick={() => handleNavigation("/company/internships")}
              className="justify-start w-full"
            >
              <Briefcase className="w-4 h-4 mr-3" />
              Internships
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => navigate("/company/internships")}>
              <Briefcase className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Internships</span>
            </Button>
          )}
          {isMobile ? (
            <Button
              variant="ghost"
              onClick={() => handleNavigation("/company/profile")}
              className="justify-start w-full"
            >
              <User className="w-4 h-4 mr-3" />
              Profile
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => navigate("/company/profile")}>
              <User className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          )}
        </>
      )}
      {isMobile ? (
        <div className="pt-2 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="justify-start w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        </div>
      ) : (
        <>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              InternOrbit
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavItems />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80">
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-primary-foreground" />
                    </div>
                    InternOrbit
                  </SheetTitle>
                </SheetHeader>
                <div className="px-1 space-y-4">
                  <NavItems isMobile={true} />
                  
                  {/* Theme Toggle for Mobile */}
                  <div className="pt-2 border-t border-border">
                    <Button
                      variant="ghost"
                      onClick={toggleTheme}
                      className="justify-start w-full"
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun className="w-4 h-4 mr-3" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4 mr-3" />
                          Dark Mode
                        </>
                      )}
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;