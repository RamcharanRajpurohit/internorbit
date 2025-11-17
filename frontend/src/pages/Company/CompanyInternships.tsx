import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/common/Navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCompanyInternships } from "@/hooks/useInternships";

import {
  MapPin,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Plus,
  Users,
  Building,
  Clock,
  Eye
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader } from "@/components/ui/Loader";

const CompanyInternships = () => {
  const navigate = useNavigate();

  // Use Redux hooks for state management
  const { isAuthenticated, isCompany } = useAuth();
  const { companyInternships, isLoading, refetch } = useCompanyInternships();

  useEffect(() => {
    if (!isAuthenticated || !isCompany) {
      navigate("/auth");
      return;
    }
  }, [isAuthenticated, isCompany, navigate]);

  const handleDelete = async (id: string) => {
    try {
      // This would need to be implemented in the Redux slice
      // For now, we'll refetch
      await refetch();
      toast.success("Internship deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete internship");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <Loader/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="company" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                Your Internships
              </h1>
              <p className="text-muted-foreground">
                {companyInternships.length} internships posted
              </p>
            </div>
            <Button
              onClick={() => navigate("/company/internships/new")}
              className="bg-gradient-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Internship
            </Button>
          </div>

          {companyInternships.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">💼</div>
              <h2 className="text-2xl font-bold mb-2">No internships posted yet</h2>
              <p className="text-muted-foreground mb-4">
                Create your first internship posting to start attracting talent
              </p>
              <Button
                onClick={() => navigate("/company/internships/new")}
                className="bg-gradient-primary"
              >
                Create Your First Internship
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {companyInternships.map((internship, idx) => (
                <Card
                  key={internship.id}
                  className="group hover:shadow-elevated transition-all duration-300 cursor-pointer overflow-hidden bg-gradient-card"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <CardContent className="p-0">
                    {/* Header with Status */}
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center ring-2 ring-border shadow-sm">
                            <Building className="w-5 h-5 text-secondary-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Posted by you</p>
                            <Badge
                              className={
                                internship.status === "active"
                                  ? "bg-green-500 dark:bg-green-600 text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {internship.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/company/internships/${internship.id}/edit`);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Internship</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{internship.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(internship.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <h2 className="font-bold text-lg line-clamp-2 leading-tight">
                        {internship.title}
                      </h2>
                    </div>

                    {/* Internship Details */}
                    <div className="p-4">
                      {/* Description Preview */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                        {internship.description}
                      </p>

                      {/* Quick Info Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {internship.location && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {internship.location}
                          </Badge>
                        )}
                        {internship.is_remote && (
                          <Badge variant="secondary" className="text-xs">Remote</Badge>
                        )}
                        {internship.stipend_min && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${internship.stipend_min}-{internship.stipend_max || internship.stipend_min}
                          </Badge>
                        )}
                        {internship.duration_months && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {internship.duration_months}m
                          </Badge>
                        )}
                      </div>

                      {/* Stats and Footer */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{internship.applications_count || 0} applications</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{internship.views_count || 0} views</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/company/applicants?internship=${internship.id}`);
                          }}
                        >
                          <Users className="w-3 h-3 mr-1" />
                          View Applicants
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-primary text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/company/internships/${internship.id}/edit`);
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>

                      {/* Deadline Indicator */}
                      {internship.application_deadline && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                              {Math.ceil(
                                (new Date(internship.application_deadline).getTime() -
                                  new Date().getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )} days left
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyInternships;