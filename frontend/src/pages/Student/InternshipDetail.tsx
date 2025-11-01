// frontend/src/pages/InternshipDetail.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { internshipAPI, interactionAPI } from "@/lib/api";
import { getSession } from "@/integrations/supabase/client";
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
} from "lucide-react";
import { Loader } from "@/components/ui/Loader";

const InternshipDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [internship, setInternship] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [userRole, setUserRole] = useState<"student" | "company">("student");

  useEffect(() => {
    loadInternship();
    checkIfSaved();
    checkUserRole();
  }, [id]);

  const checkUserRole = async () => {
    try {
      const session = await getSession();
      if (session?.user) {
        // Get role from backend
        const response = await fetch(`${import.meta.env.VITE_API_URI}/auth/me`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const data = await response.json();
        setUserRole(data.user.role);
      }
    } catch (error) {
      console.error("Error checking role:", error);
    }
  };

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

  const checkIfSaved = async () => {
    try {
      const response = await interactionAPI.checkIfSaved(id!);
      setIsSaved(response.isSaved);
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await interactionAPI.unsaveJob(id!);
        setIsSaved(false);
        toast.success("Removed from saved");
      } else {
        await interactionAPI.saveJob(id!);
        setIsSaved(true);
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

  const company = internship.company_id;
  const companyProfile = company;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role={userRole} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="shadow-elevated">
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {companyProfile?.logo_url ? (
                    <img
                      src={companyProfile.logo_url}
                      alt={companyProfile.company_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-secondary flex items-center justify-center">
                      <Building className="w-8 h-8 text-secondary-foreground" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-3xl mb-2">
                      {internship.title}
                    </CardTitle>
                    <p className="text-lg text-muted-foreground">
                      {companyProfile?.company_name || "Company"}
                    </p>
                  </div>
                </div>
                {userRole === "student" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSave}
                      className={isSaved ? "text-primary" : ""}
                    >
                      <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                    </Button>
                    <Button onClick={handleApply} className="bg-gradient-primary">
                      <Send className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {/* Quick Info */}
              <div className="flex flex-wrap gap-3 mb-6">
                {internship.location && (
                  <Badge variant="secondary" className="text-base py-2 px-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    {internship.location}
                  </Badge>
                )}
                {internship.is_remote && (
                  <Badge variant="secondary" className="text-base py-2 px-4">
                    Remote
                  </Badge>
                )}
                {internship.stipend_min && (
                  <Badge variant="secondary" className="text-base py-2 px-4">
                    <DollarSign className="w-4 h-4 mr-2" />
                    ${internship.stipend_min}-${internship.stipend_max}/mo
                  </Badge>
                )}
                {internship.duration_months && (
                  <Badge variant="secondary" className="text-base py-2 px-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    {internship.duration_months} months
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {internship.applications_count || 0}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {internship.positions_available || 1}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Positions</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {internship.application_deadline
                        ? Math.ceil(
                            (new Date(internship.application_deadline).getTime() -
                              new Date().getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : "N/A"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Days Left</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3">About the Role</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {internship.description}
                </p>
              </div>

              {/* Responsibilities */}
              {internship.responsibilities && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3">Responsibilities</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {internship.responsibilities}
                  </p>
                </div>
              )}

              {/* Requirements */}
              {internship.requirements && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3">Requirements</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {internship.requirements}
                  </p>
                </div>
              )}

              {/* Skills */}
              {internship.skills_required && internship.skills_required.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {internship.skills_required.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-base py-2 px-4">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Info */}
              {companyProfile && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-3">About the Company</h3>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      {companyProfile.description || "No description available"}
                    </p>
                    {companyProfile.industry && (
                      <p className="text-sm">
                        <span className="font-semibold">Industry:</span>{" "}
                        {companyProfile.industry}
                      </p>
                    )}
                    {companyProfile.company_size && (
                      <p className="text-sm">
                        <span className="font-semibold">Size:</span>{" "}
                        {companyProfile.company_size} employees
                      </p>
                    )}
                    {companyProfile.website && (
                      <a
                        href={companyProfile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Visit Website →
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Apply Section */}
              {userRole === "student" && (
                <div className="mt-8 p-6 bg-gradient-card rounded-lg text-center">
                  <h3 className="text-2xl font-bold mb-2">Ready to Apply?</h3>
                  <p className="text-muted-foreground mb-4">
                    Submit your application and take the next step in your career
                  </p>
                  <Button
                    size="lg"
                    onClick={handleApply}
                    className="bg-gradient-primary"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Apply Now
                  </Button>
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