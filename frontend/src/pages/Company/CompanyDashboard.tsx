import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Navigation from "@/components/common/Navigation";
import { Plus, Briefcase, Users, TrendingUp, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouteRefresh } from "@/hooks/useRouteRefresh";
import { useCompanyInternships } from "@/hooks/useInternships";
import { Loader } from "@/components/ui/Loader";

const CompanyDashboard = () => {
  const navigate = useNavigate();

  // Use Redux hooks for state management
  const { isAuthenticated, isCompany } = useAuth();
  
  // Detect browser refresh and refetch data
  useRouteRefresh(isCompany ? 'company' : null);
  
  const { companyInternships, isLoading, refetch } = useCompanyInternships();

  useEffect(() => {
    if (!isAuthenticated || !isCompany) {
      navigate("/auth");
      return;
    }
  }, [isAuthenticated, isCompany, navigate]);

  // Calculate stats from internships
  const stats = {
    totalInternships: companyInternships.length,
    totalApplications: companyInternships.reduce(
      (sum, i) => sum + (i.application_count || 0),
      0
    ),
    totalViews: companyInternships.reduce(
      (sum, i) => sum + (i.views_count || 0),
      0
    ),
  };

  // Remove full-page loader for company too
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="company" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                Company Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your internship postings and applications
              </p>
            </div>
            <Button
              size="lg"
              className="bg-gradient-primary hover:shadow-glow transition-all"
              onClick={() => navigate("/company/internships/new")}
            >
              <Plus className="w-5 h-5 mr-2" />
              Post Internship
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {isLoading ? (
              // Skeleton loaders for stats
              <>
                {[...Array(3)].map((_, index) => (
                  <Card key={`skeleton-${index}`} className="p-6 shadow-card animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-muted rounded-lg"></div>
                      <div className="w-8 h-8 bg-muted rounded-full"></div>
                    </div>
                    <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-32"></div>
                  </Card>
                ))}
              </>
            ) : (
              <>
            <Card className="p-6 shadow-card hover:shadow-elevated transition-all bg-gradient-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                  <Briefcase className="w-6 h-6 text-primary-foreground" />
                </div>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Internships</p>
              <p className="text-3xl font-bold">{stats.totalInternships}</p>
            </Card>

            <Card className="p-6 shadow-card hover:shadow-elevated transition-all bg-gradient-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-glow">
                  <Users className="w-6 h-6 text-secondary-foreground" />
                </div>
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Applications</p>
              <p className="text-3xl font-bold">{stats.totalApplications}</p>
            </Card>

            <Card className="p-6 shadow-card hover:shadow-elevated transition-all bg-gradient-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                  <Eye className="w-6 h-6 text-primary-foreground" />
                </div>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Profile Views</p>
              <p className="text-3xl font-bold">{stats.totalViews}</p>
            </Card>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <Card className="p-8 shadow-card bg-gradient-card">
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="justify-start h-auto py-4"
                onClick={() => navigate("/company/internships")}
              >
                <Briefcase className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">View All Internships</div>
                  <div className="text-sm text-muted-foreground">Manage your postings</div>
                </div>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="justify-start h-auto py-4"
                onClick={() => navigate("/company/applicants")}
              >
                <Users className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">View Applicants</div>
                  <div className="text-sm text-muted-foreground">Review applications</div>
                </div>
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;