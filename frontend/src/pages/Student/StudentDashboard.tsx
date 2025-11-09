import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import { useInternships } from "@/hooks/useInternships";
import { useSavedJobs } from "@/hooks/useSaved";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Navigation from "@/components/common/Navigation";
import { Loader } from "@/components/ui/Loader";
import {
  MapPin,
  DollarSign,
  Calendar,
  Heart,
  Building,
  Clock,
  Send
} from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();

  // Use Redux hooks for state management - let hooks handle auto-fetch
  const { isAuthenticated, isStudent } = useAuth();
  const { internships, isLoading } = useInternships(true, { page: 1, limit: 50 }); // Enable auto-fetch
  const { saveJob, unsaveJob } = useSavedJobs(false); // Explicitly disable auto-fetch for dashboard

  // Get saved jobs to check saved status
  const savedJobs = useSelector((state: any) => state.interaction.savedJobs);

  // State for managing filtered internships
  const [filteredInternships, setFilteredInternships] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !isStudent) {
      navigate("/auth");
      return;
    }
  }, [isAuthenticated, isStudent, navigate]);

  // Get saved internship IDs for checking saved status
  const savedInternshipIds = useMemo(() => {
    const ids = new Set();
    if (Array.isArray(savedJobs)) {
      savedJobs.forEach((savedJob: any) => {
        let internshipId = null;
        if (typeof savedJob.internship_id === 'object') {
          internshipId = savedJob.internship_id._id || savedJob.internship_id.id;
        } else if (typeof savedJob.internship === 'object') {
          internshipId = savedJob.internship._id || savedJob.internship.id;
        } else if (savedJob._id || savedJob.id) {
          internshipId = savedJob._id || savedJob.id;
        } else if (typeof savedJob.internship_id === 'string') {
          internshipId = savedJob.internship_id;
        }
        if (internshipId) {
          ids.add(internshipId);
        }
      });
    }
    return ids;
  }, [savedJobs]);

  // Update filtered internships when data changes
  useEffect(() => {
    if (internships.length > 0) {
      setFilteredInternships(internships);
    }
  }, [internships]);

  // Handle save/unsave functionality
  const handleSave = async (internshipId: string, isCurrentlySaved: boolean, internshipData?: any) => {
    try {
      if (isCurrentlySaved) {
        await unsaveJob(internshipId);
        toast.success("Removed from saved");
      } else {
        await saveJob(internshipId, internshipData);
        toast.success("Internship saved!");
      }
    } catch (error: any) {
      console.error("Error saving/unsaving internship:", error);
      toast.error(error.message || "Failed to save internship");
    }
  };

  // Handle navigation to internship details
  const handleViewDetails = (internshipId: string) => {
    navigate(`/internship/${internshipId}`);
  };

  // Handle apply to internship
  const handleApply = (internshipId: string) => {
    navigate(`/apply/${internshipId}`);
  };

  // Check if an internship is saved
  const isInternshipSaved = (internship: any) => {
    const internshipId = internship._id || internship.id;
    return savedInternshipIds.has(internshipId);
  };

  // Get company info safely
  const getCompanyInfo = (internship: any) => {
    let companyName = "Company";
    let companyLogo = null;

    if (internship.company?.company_profiles?.[0]) {
      companyName = internship.company.company_profiles[0].company_name;
      companyLogo = internship.company.company_profiles[0].logo_url;
    } else if (internship.company_id && typeof internship.company_id === 'object') {
      companyName = internship.company_id.company_name || "Company";
      companyLogo = internship.company_id.logo_url;
    }

    return { companyName, companyLogo };
  };

  if (isLoading && internships.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <Loader/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="student" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Discover Internships
            </h1>
            <p className="text-muted-foreground">Browse and save opportunities that interest you</p>
          </div>

          {filteredInternships.length === 0 && !isLoading ? (
            <div className="text-center animate-scale-in py-20">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">No internships available</h2>
              <p className="text-muted-foreground mb-4">
                Check back later for new opportunities
              </p>
              <Button
                onClick={() => navigate("/saved")}
                className="bg-gradient-primary"
              >
                View Saved Internships
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredInternships.map((internship, index) => {
                const internshipId = internship._id || internship.id;
                const isSaved = isInternshipSaved(internship);
                const { companyName, companyLogo } = getCompanyInfo(internship);

                return (
                  <Card
                    key={internshipId || index}
                    className="group hover:shadow-elevated transition-all duration-300 cursor-pointer overflow-hidden bg-gradient-card"
                  >
                    <CardContent className="p-0">
                      {/* Company Header */}
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center gap-3 mb-3">
                          {companyLogo ? (
                            <img
                              src={companyLogo}
                              alt={companyName}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-secondary flex items-center justify-center ring-2 ring-border">
                              <Building className="w-5 h-5 text-secondary-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{companyName}</h3>
                            <p className="text-xs text-muted-foreground">
                              {internship.applications_count || 0} applications
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave(internshipId, isSaved, internship);
                            }}
                          >
                            <Heart
                              className={`w-4 h-4 ${isSaved ? "fill-current text-red-500" : "text-muted-foreground"}`}
                            />
                          </Button>
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

                        {/* Skills Preview */}
                        {internship.skills_required && internship.skills_required.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {internship.skills_required.slice(0, 3).map((skill: string, skillIndex: number) => (
                                <Badge key={skillIndex} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {internship.skills_required.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{internship.skills_required.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(internshipId);
                            }}
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-primary text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply(internshipId);
                            }}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Apply
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
                );
              })}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
