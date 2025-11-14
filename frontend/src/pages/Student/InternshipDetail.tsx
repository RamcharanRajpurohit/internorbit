// frontend/src/pages/InternshipDetail.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { internshipAPI } from "@/lib/api";
import { useSavedJobs } from "@/hooks/useSaved";
import { useAuth } from "@/hooks/useAuth";
import { useRouteRefresh } from "@/hooks/useRouteRefresh";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Navigation from "@/components/common/Navigation";
import {
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Users,
  Building,
  Heart,
  Send,
  ArrowLeft,
  Briefcase,
} from "lucide-react";
import { Loader } from "@/components/ui/Loader";

const InternshipDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, isStudent } = useAuth();
  
  // Detect browser refresh and refetch data
  useRouteRefresh(isStudent ? 'student' : null);
  
  const { saveJob, unsaveJob, savedJobs } = useSavedJobs(false);
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [internship, setInternship] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated || !isStudent) {
      navigate("/auth");
      return;
    }
    loadInternship();
  }, [id, isAuthenticated, isStudent, navigate]);

  // Check if internship is saved based on Redux state
  const isSaved = savedJobs.some(savedJob => {
    let savedInternshipId = null;
    if (typeof savedJob.internship_id === 'object') {
      savedInternshipId = savedJob.internship_id._id || savedJob.internship_id.id;
    } else if (typeof savedJob.internship === 'object') {
      savedInternshipId = savedJob.internship._id || savedJob.internship.id;
    } else if (savedJob._id || savedJob.id) {
      savedInternshipId = savedJob._id || savedJob.id;
    } else if (typeof savedJob.internship_id === 'string') {
      savedInternshipId = savedJob.internship_id;
    }
    return savedInternshipId === id;
  });

  const loadInternship = async () => {
    try {
      setLoading(true);
      const response = await internshipAPI.getById(id!);
      setInternship(response.internship);
    } catch (error: any) {
      toast.error("Failed to load internship");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  
  const handleSave = async () => {
    try {
      if (isSaved) {
        await unsaveJob(id!);
        toast.success("Removed from saved");
      } else {
        await saveJob(id!, internship); // Pass the full internship data
        toast.success("Saved successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save internship");
    }
  };

  const handleApply = () => {
    navigate(`/apply/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <Loader/>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Internship not found</h2>
          <Button onClick={() => navigate("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Handle company data from API response
  const companyData = internship.company || internship.company_id;
  const companyProfile = companyData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="student" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {!isMobile && (
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-6 hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          <Card className="shadow-card overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  {companyProfile?.company_profiles?.[0]?.logo_url || companyProfile?.logo_url ? (
                    <img
                      src={companyProfile?.company_profiles?.[0]?.logo_url || companyProfile?.logo_url}
                      alt={companyProfile?.company_profiles?.[0]?.company_name || companyProfile?.company_name || "Company"}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover ring-2 ring-border shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-secondary flex items-center justify-center ring-2 ring-border shadow-sm flex-shrink-0">
                      <Building className="w-6 h-6 sm:w-8 sm:h-8 text-secondary-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-xl sm:text-2xl lg:text-3xl mb-1 sm:mb-2 bg-gradient-primary bg-clip-text text-transparent break-words">
                      {internship.title}
                    </CardTitle>
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground flex items-center gap-2">
                      <Building className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {companyProfile?.company_profiles?.[0]?.company_name ||
                         companyProfile?.company_name ||
                         "Company"}
                      </span>
                    </p>
                  </div>
                </div>
                {isStudent && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSave}
                      className={`flex-shrink-0 ${isSaved ? "text-primary" : ""}`}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                    </Button>
                    {internship.has_applied ? (
                      <Button 
                        className="flex-1 sm:flex-initial"
                        size="default"
                        variant="secondary"
                        disabled
                      >
                        <span className="text-sm text-green-600 font-semibold">✓ Applied</span>
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleApply} 
                        className="bg-gradient-primary flex-1 sm:flex-initial"
                        size="default"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        <span className="text-sm">Apply Now</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {/* Quick Info */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                {internship.location && (
                  <Badge variant="secondary" className="text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    {internship.location}
                  </Badge>
                )}
                {internship.is_remote && (
                  <Badge variant="secondary" className="text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4">
                    Remote
                  </Badge>
                )}
                {internship.stipend_min && (
                  <Badge variant="secondary" className="text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4">
                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    ${internship.stipend_min}-${internship.stipend_max}/mo
                  </Badge>
                )}
                {internship.duration_months && (
                  <Badge variant="secondary" className="text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    {internship.duration_months} months
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8 p-3 sm:p-6 bg-gradient-card rounded-xl border border-border">
                <div className="text-center p-2 sm:p-4">
                  <div className="flex flex-col items-center justify-center gap-1 mb-1 sm:mb-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    <span className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent whitespace-nowrap">
                      {internship.applications_count || 0}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-sm text-muted-foreground leading-tight">Applications</p>
                </div>
                <div className="text-center p-2 sm:p-4 border-l border-r border-border">
                  <div className="flex flex-col items-center justify-center gap-1 mb-1 sm:mb-2">
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    <span className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent whitespace-nowrap">
                      {internship.positions_available || 1}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-sm text-muted-foreground leading-tight">Positions</p>
                </div>
                <div className="text-center p-2 sm:p-4">
                  <div className="flex flex-col items-center justify-center gap-1 mb-1 sm:mb-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    <span className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent whitespace-nowrap">
                      {internship.application_deadline
                        ? Math.ceil(
                            (new Date(internship.application_deadline).getTime() -
                              new Date().getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : "N/A"}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-sm text-muted-foreground leading-tight">Days Left</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3">About the Role</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {internship.description}
                </p>
              </div>

              {/* Responsibilities */}
              {internship.responsibilities && (
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-3">Responsibilities</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                    {internship.responsibilities}
                  </p>
                </div>
              )}

              {/* Requirements */}
              {internship.requirements && (
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-3">Requirements</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                    {internship.requirements}
                  </p>
                </div>
              )}

              {/* Skills */}
              {internship.skills_required && internship.skills_required.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {internship.skills_required.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Info */}
              {companyProfile && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="text-lg sm:text-xl font-bold mb-3">About the Company</h3>
                  <div className="space-y-2 text-sm sm:text-base">
                    <p className="text-muted-foreground">
                      {companyProfile?.company_profiles?.[0]?.description ||
                       companyProfile?.description ||
                       "No description available"}
                    </p>
                    {companyProfile?.company_profiles?.[0]?.industry || companyProfile?.industry ? (
                      <p className="text-sm">
                        <span className="font-semibold">Industry:</span>{" "}
                        {companyProfile?.company_profiles?.[0]?.industry || companyProfile?.industry}
                      </p>
                    ) : null}
                    {companyProfile?.company_profiles?.[0]?.company_size || companyProfile?.company_size ? (
                      <p className="text-sm">
                        <span className="font-semibold">Size:</span>{" "}
                        {companyProfile?.company_profiles?.[0]?.company_size || companyProfile?.company_size} employees
                      </p>
                    ) : null}
                    {companyProfile?.company_profiles?.[0]?.website || companyProfile?.website ? (
                      <a
                        href={companyProfile?.company_profiles?.[0]?.website || companyProfile?.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-block"
                      >
                        Visit Website →
                      </a>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Apply Section */}
              {isStudent && (
                <div className="mt-8 p-4 sm:p-6 bg-gradient-card rounded-lg text-center">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Ready to Apply?</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">
                    Submit your application and take the next step in your career
                  </p>
                  {internship.has_applied ? (
                    <Button
                      size="lg"
                      className="w-full sm:w-auto"
                      variant="secondary"
                      disabled
                    >
                      <span className="text-sm sm:text-base text-green-600 font-semibold">✓ Already Applied</span>
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={handleApply}
                      className="bg-gradient-primary w-full sm:w-auto"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      <span className="text-sm sm:text-base">Apply Now</span>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default InternshipDetail;