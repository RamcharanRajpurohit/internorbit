// frontend/src/pages/CompanyPublicProfile.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { companyProfileAPI, internshipAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import {
  Building,
  MapPin,
  Users,
  Globe,
  Briefcase,
  DollarSign,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

const CompanyPublicProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [internships, setInternships] = useState<any[]>([]);

  useEffect(() => {
    loadCompanyProfile();
  }, [id]);

  const loadCompanyProfile = async () => {
    try {
      setLoading(true);
      const response = await companyProfileAPI.getPublicProfile(id!);
      setCompany(response.profile);
      
      // Load company's active internships
      const internshipsResponse = await internshipAPI.getAll({
        page: 1,
        limit: 10,
      });
      
      // Filter internships for this company
      const companyInternships = internshipsResponse.internships.filter(
        (i: any) => i.company_id._id === id
      );
      setInternships(companyInternships);
    } catch (error: any) {
      toast.error("Failed to load company profile");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-pulse text-2xl text-primary">Loading...</div>
      </div>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="student" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Company Header */}
          <Card className="shadow-elevated mb-8">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.company_name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-secondary flex items-center justify-center">
                    <Building className="w-12 h-12 text-secondary-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-2">{company.company_name}</h1>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {company.industry && (
                      <Badge variant="secondary" className="text-base py-1 px-3">
                        {company.industry}
                      </Badge>
                    )}
                    {company.company_size && (
                      <Badge variant="secondary" className="text-base py-1 px-3">
                        <Users className="w-4 h-4 mr-1" />
                        {company.company_size} employees
                      </Badge>
                    )}
                    {company.location && (
                      <Badge variant="secondary" className="text-base py-1 px-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        {company.location}
                      </Badge>
                    )}
                  </div>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          {company.description && (
            <Card className="shadow-card mb-8">
              <CardHeader>
                <CardTitle>About {company.company_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {company.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Open Positions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Open Positions</span>
                <Badge variant="secondary">{internships.length} Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {internships.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">No open positions</h3>
                  <p className="text-muted-foreground">
                    Check back later for new opportunities
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {internships.map((internship) => (
                    <Card
                      key={internship._id}
                      className="hover:shadow-elevated transition-shadow cursor-pointer"
                      onClick={() => navigate(`/internship/${internship._id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">
                              {internship.title}
                            </h3>
                            <p className="text-muted-foreground line-clamp-2 mb-3">
                              {internship.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {internship.location && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {internship.location}
                            </Badge>
                          )}
                          {internship.is_remote && (
                            <Badge variant="outline">Remote</Badge>
                          )}
                          {internship.stipend_min && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${internship.stipend_min}-${internship.stipend_max}/mo
                            </Badge>
                          )}
                          {internship.duration_months && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {internship.duration_months} months
                            </Badge>
                          )}
                        </div>

                        {internship.skills_required && internship.skills_required.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {internship.skills_required.slice(0, 5).map((skill: string, idx: number) => (
                              <Badge key={idx} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                            {internship.skills_required.length > 5 && (
                              <Badge variant="secondary">
                                +{internship.skills_required.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
              </Card>
            </div>
          </main>
        </div>
      );
    };
    
    export default CompanyPublicProfile;