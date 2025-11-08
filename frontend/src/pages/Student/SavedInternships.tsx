import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Navigation from "@/components/common/Navigation";
import {
  MapPin, DollarSign, Calendar, Trash2, Building,
  Clock, Send
} from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/hooks/useAuth";
import { useSavedJobs } from "@/hooks/useSaved";

const SavedInternships = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  // Use our new state management hooks
  const { isAuthenticated, isStudent } = useAuth();
  const defaultParams = useMemo(() => ({ page: 1, limit: 10 }), []);
  const {
    savedJobs: saved,
    isLoading,
    error,
    pagination,
    unsaveJob,
    fetchSavedJobs,
  } = useSavedJobs(true, defaultParams);

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!isAuthenticated || !isStudent) {
      navigate("/auth");
    }
  }, [isAuthenticated, isStudent, navigate]);

  // Sync page state with Redux pagination (only when pagination changes)
  useEffect(() => {
    if (pagination?.page && pagination.page !== page) {
      setPage(pagination.page);
    }
  }, [pagination?.page, page]); // Added page to prevent infinite loops

  // Fetch saved jobs when page changes (only for pages > 1)
  useEffect(() => {
    // Only fetch for page changes > 1, page 1 is handled by the hook
    if (isAuthenticated && isStudent && page > 1) {
      fetchSavedJobs({ page, limit: 10 });
    }
  }, [page, isAuthenticated, isStudent, fetchSavedJobs]);

  const handleUnsave = async (_savedJobId: string, internshipId: string) => {
    try {
      await unsaveJob(internshipId); // Pass internshipId to API
      toast.success("Removed from saved");
      // No need to refetch - Redux state should be updated automatically by the unsaveJob action
    } catch (error: any) {
      console.error('❌ Handle Unsave Error:', error);
      toast.error("Failed to unsave internship");
    }
  };
  

  const handleApply = async (internshipId: string) => {
    try {
       navigate(`/apply/${internshipId}`);
    } catch (error: any) {
      toast.error("Failed to navigate to application");
    }
  };

  // Debug and ensure savedJobs is an array - memoize to prevent unnecessary re-renders
  const savedJobsArray = useMemo(() => {
    const jobs = Array.isArray(saved) ? saved : [];
    console.log('💾 Saved jobs data:', jobs);
    return jobs;
  }, [saved]);

  // Debug logging to understand data structure
  useEffect(() => {
    console.log('💾 Saved jobs state updated:', {
      saved,
      isLoading,
      error,
      pagination,
      isArray: Array.isArray(saved),
      length: Array.isArray(saved) ? saved.length : 0
    });
  }, [saved, isLoading, error, pagination]);

  const total = pagination?.total || savedJobsArray.length;

  if (isLoading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="student" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Saved Internships
            </h1>
            <p className="text-muted-foreground">
              {total} internships saved
            </p>
          </div>

          {savedJobsArray.length === 0 ? (
            <div className="text-center animate-scale-in py-20">
              <div className="text-6xl mb-4">💖</div>
              <h2 className="text-2xl font-bold mb-2">No saved internships yet</h2>
              <p className="text-muted-foreground mb-4">
                Browse internships and save the ones you're interested in
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-gradient-primary"
              >
                Discover Internships
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedJobsArray.map((item, index) => {
                // Handle different data structures for internship
                let internship = null;

                if (typeof item.internship_id === 'object' && item.internship_id) {
                  internship = item.internship_id;
                } else if (typeof item.internship === 'object' && item.internship) {
                  internship = item.internship;
                } else if (item._id ) {
                  internship = item;
                }

                // Handle missing internship data
                if (!internship) {
                  return null;
                }

                const internshipId = internship._id || internship.id || item._id || item.id;

                // Handle company data safely
                let companyName = "Company";
                let companyLogo = null;

                if (internship.company?.company_name) {
                  companyName = internship.company.company_name;
                  companyLogo = internship.company.logo_url;
                } else if (internship.company_id && typeof internship.company_id === 'object') {
                  companyName = internship.company_id.company_name || "Company";
                  companyLogo = internship.company_id.logo_url;
                }

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
                              Saved {new Date(item.saved_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnsave(item._id || item.id, internshipId);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
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
                        {internship.skills_required && Array.isArray(internship.skills_required) && internship.skills_required.length > 0 && (
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
                              navigate(`/internship/${internshipId}`);
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

                        {/* Application Deadline Footer */}
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

          {/* Pagination */}
          {savedJobsArray.length > 0 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {pagination?.page || page} of {pagination?.totalPages || Math.ceil(total / 10)}
              </span>
              <Button
                onClick={() => setPage(page + 1)}
                disabled={page >= (pagination?.totalPages || Math.ceil(total / 10))}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedInternships;