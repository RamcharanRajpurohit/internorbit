import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { interactionAPI, applicationAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { MapPin, DollarSign, Calendar, Heart, Trash2 } from "lucide-react";

const SavedInternships = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    checkAuth();
    loadSavedInternships();
  }, [page]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadSavedInternships = async () => {
    try {
      setLoading(true);
      const response = await interactionAPI.getSavedJobs({
        page,
        limit: 10,
      });
      
      console.log("Backend response:", response);
      
      setSaved(response.saved || []);
      setTotal(response.pagination?.total || 0);
    } catch (error: any) {
      console.error("Error loading saved internships:", error);
      toast.error("Failed to load saved internships");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (internshipId: string) => {
    try {
      await interactionAPI.unsaveJob(internshipId);
      // Fixed: Check against internship_id instead of internship.id
      setSaved(saved.filter(s => s.internship_id?._id !== internshipId));
      toast.success("Removed from saved");
    } catch (error: any) {
      toast.error("Failed to unsave internship");
    }
  };

  const handleApply = async (internshipId: string) => {
    try {
      navigate("/applications/new", { state: { internshipId } });
    } catch (error: any) {
      toast.error("Failed to navigate to application");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-pulse text-2xl text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="student" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Saved Internships
            </h1>
            <p className="text-muted-foreground">
              {total} internships saved
            </p>
          </div>

          {saved.length === 0 ? (
            <Card className="text-center p-12">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold mb-2">No saved internships yet</h3>
              <p className="text-muted-foreground mb-6">
                Swipe right on internships you're interested in to save them
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-gradient-primary"
              >
                Discover Internships
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {saved.map((item) => {
                // Fixed: Access internship_id instead of internship
                const internship = item.internship_id;
                
                // Handle missing internship data
                if (!internship) {
                  return null;
                }

                // Fixed: Access company_id and handle the nested structure
                const company = internship.company_id;
                const companyName = company?.company_name || company?.name || "Company";
                const companyLogo = company?.logo_url;

                return (
                  <Card key={internship._id} className="hover:shadow-elevated transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {companyLogo ? (
                              <img
                                src={companyLogo}
                                alt={companyName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-secondary flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {companyName[0]}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-muted-foreground">
                                {companyName}
                              </p>
                            </div>
                          </div>
                          <CardTitle className="text-2xl">{internship.title}</CardTitle>
                          <CardDescription className="mt-1">
                            Saved {new Date(item.saved_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUnsave(internship._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {internship.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {internship.location && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {internship.location}
                          </Badge>
                        )}
                        {internship.is_remote && (
                          <Badge variant="secondary">Remote</Badge>
                        )}
                        {internship.stipend_min && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${internship.stipend_min}-${internship.stipend_max}/mo
                          </Badge>
                        )}
                        {internship.duration_months && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {internship.duration_months} months
                          </Badge>
                        )}
                      </div>

                      {internship.skills_required && internship.skills_required.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold mb-2">Required Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {internship.skills_required.map((skill: string, index: number) => (
                              <Badge key={`${skill}-${index}`} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => navigate(`/internship/${internship._id}`)}
                          variant="outline"
                          className="flex-1"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => handleApply(internship._id)}
                          className="flex-1 bg-gradient-primary"
                        >
                          Apply Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {Math.ceil(total / 10)}
                </span>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedInternships;