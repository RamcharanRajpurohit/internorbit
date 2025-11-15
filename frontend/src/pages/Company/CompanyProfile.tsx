import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader } from "@/components/ui/Loader";
import Navigation from "@/components/common/Navigation";
import {
  Save, Edit, X, Plus, Trash2,
  Building, Globe, Users, MapPin,
  Mail, Phone, Calendar,
  Link as LinkIcon, Briefcase
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouteRefresh } from "@/hooks/useRouteRefresh";
import { useCompanyProfile } from "@/hooks/useProfile";


const CompanyProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Use our new state management hooks
  const { isAuthenticated, isCompany } = useAuth();
  
  // Detect browser refresh and refetch data
  useRouteRefresh(isCompany ? 'company' : null);
  const {
    companyProfile,
    isLoading,
    updateProfile,
  } = useCompanyProfile();

  const [formData, setFormData] = useState({
    company_name: "",
    description: "",
    website: "",
    industry: "",
    company_size: "",
    location: "",
    logo_url: "",
    contact_email: "",
    contact_phone: "",
    linkedin_url: "",
    founded_year: new Date().getFullYear(),
  });

  // Additional company info
  const [values, setValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState("");
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState("");

  // Redirect if not authenticated or not a company
  useEffect(() => {
    if (!isAuthenticated || !isCompany) {
      navigate("/auth");
    }
  }, [isAuthenticated, isCompany, navigate]);

  // Update form data when profile changes
  useEffect(() => {
    if (companyProfile) {
      setFormData({
        company_name: companyProfile.company_name || "",
        description: companyProfile.description || "",
        website: companyProfile.website || "",
        industry: companyProfile.industry || "",
        company_size: companyProfile.size || "",
        location: companyProfile.headquarters || "",
        logo_url: companyProfile.logo_url || "",
        contact_email: (companyProfile as any).contact_email || "",
        contact_phone: (companyProfile as any).contact_phone || "",
        linkedin_url: (companyProfile as any).linkedin_url || "",
        founded_year: (companyProfile as any).founded_year || new Date().getFullYear(),
      });
      setValues((companyProfile as any).values || []);
      setBenefits((companyProfile as any).benefits || []);
    }
  }, [companyProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        ...formData,
        size: formData.company_size,
        headquarters: formData.location,
        values,
        benefits,
      });

      toast.success("Company profile saved successfully!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Values Management
  const handleAddValue = () => {
    if (newValue.trim() && !values.includes(newValue.trim())) {
      setValues([...values, newValue.trim()]);
      setNewValue("");
    }
  };

  const handleRemoveValue = (value: string) => {
    setValues(values.filter((v) => v !== value));
  };

  // Benefits Management
  const handleAddBenefit = () => {
    if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const handleRemoveBenefit = (benefit: string) => {
    setBenefits(benefits.filter((b) => b !== benefit));
  };

  // Remove full-page loader - show content with skeleton loaders
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="company" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-gradient-card rounded-2xl p-8 border border-border shadow-card">
              {isLoading ? (
                // Skeleton loader for company profile header
                <div className="animate-pulse">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-24 h-24 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-3 text-center md:text-left w-full">
                      <div className="h-8 bg-muted rounded w-48 mx-auto md:mx-0"></div>
                      <div className="h-4 bg-muted rounded w-32 mx-auto md:mx-0"></div>
                      <div className="h-16 bg-muted rounded w-full"></div>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <div className="h-8 bg-muted rounded w-24"></div>
                        <div className="h-8 bg-muted rounded w-24"></div>
                        <div className="h-8 bg-muted rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 ring-4 ring-border shadow-lg">
                    <AvatarImage src={formData.logo_url} />
                    <AvatarFallback className="bg-gradient-secondary text-secondary-foreground text-3xl">
                      {formData.company_name?.[0]?.toUpperCase() || "C"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary shadow-lg"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="mb-2">
                    <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
                      {formData.company_name || "Company Profile"}
                    </h1>
                    <p className="text-lg text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                      <Building className="w-4 h-4" />
                      {formData.industry || "Company"}
                    </p>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {formData.company_size} employees • Founded {formData.founded_year}
                  </p>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-medium">{formData.company_size} Team Size</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <span className="font-medium">{formData.location || "Global"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-medium">{formData.founded_year} Founded</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  disabled={saving}
                  className="bg-gradient-primary hover:shadow-glow transition-all px-6 py-3"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg">
                <Building className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="contact" className="rounded-lg">
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </TabsTrigger>
              <TabsTrigger value="culture" className="rounded-lg">
                <Users className="w-4 h-4 mr-2" />
                Culture
              </TabsTrigger>
              <TabsTrigger value="benefits" className="rounded-lg">
                <Briefcase className="w-4 h-4 mr-2" />
                Benefits
              </TabsTrigger>
              <TabsTrigger value="branding" className="rounded-lg">
                <Globe className="w-4 h-4 mr-2" />
                Branding
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* About Section */}
                <div className="lg:col-span-2">
                  <Card className="shadow-card h-full">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-primary" />
                        About Company
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <Textarea
                          placeholder="Tell students about your company, mission, values, and what makes it a great place to work..."
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          rows={6}
                          className="w-full resize-none border-muted bg-muted/50 focus:bg-background transition-colors"
                        />
                      ) : (
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line min-h-[150px]">
                          {formData.description || "No description added yet. Tell students about your company culture, mission, and what makes it a great place to work!"}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Company Info */}
                <Card className="shadow-card h-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      Company Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Location
                        </Label>
                        {isEditing ? (
                          <Input
                            placeholder="City, Country"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({ ...formData, location: e.target.value })
                            }
                          />
                        ) : (
                          <p className="text-muted-foreground">
                            {formData.location || "Not provided"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>
                          <Users className="w-4 h-4 inline mr-2" />
                          Company Size
                        </Label>
                        {isEditing ? (
                          <Input
                            placeholder="e.g., 50-100"
                            value={formData.company_size}
                            onChange={(e) =>
                              setFormData({ ...formData, company_size: e.target.value })
                            }
                          />
                        ) : (
                          <p className="text-muted-foreground">
                            {formData.company_size || "Not provided"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Founded Year
                        </Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={formData.founded_year}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                founded_year: parseInt(e.target.value),
                              })
                            }
                          />
                        ) : (
                          <p className="text-muted-foreground">
                            {formData.founded_year}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>
                          <Globe className="w-4 h-4 inline mr-2" />
                          Website
                        </Label>
                        {isEditing ? (
                          <Input
                            placeholder="https://yourcompany.com"
                            value={formData.website}
                            onChange={(e) =>
                              setFormData({ ...formData, website: e.target.value })
                            }
                          />
                        ) : formData.website ? (
                          <a
                            href={formData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-2"
                          >
                            <LinkIcon className="w-4 h-4" />
                            Visit Website
                          </a>
                        ) : (
                          <p className="text-muted-foreground">Not provided</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        <Mail className="w-4 h-4 inline mr-2" />
                        Contact Email
                      </Label>
                      {isEditing ? (
                        <Input
                          placeholder="contact@company.com"
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) =>
                            setFormData({ ...formData, contact_email: e.target.value })
                          }
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          {formData.contact_email || "Not provided"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        <Phone className="w-4 h-4 inline mr-2" />
                        Contact Phone
                      </Label>
                      {isEditing ? (
                        <Input
                          placeholder="+1 (555) 000-0000"
                          value={formData.contact_phone}
                          onChange={(e) =>
                            setFormData({ ...formData, contact_phone: e.target.value })
                          }
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          {formData.contact_phone || "Not provided"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>
                        <Globe className="w-4 h-4 inline mr-2" />
                        LinkedIn Company Page
                      </Label>
                      {isEditing ? (
                        <Input
                          placeholder="https://linkedin.com/company/yourcompany"
                          value={formData.linkedin_url}
                          onChange={(e) =>
                            setFormData({ ...formData, linkedin_url: e.target.value })
                          }
                        />
                      ) : formData.linkedin_url ? (
                        <a
                          href={formData.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          <LinkIcon className="w-4 h-4" />
                          View LinkedIn Page
                        </a>
                      ) : (
                        <p className="text-muted-foreground">Not provided</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Culture Tab */}
            <TabsContent value="culture">
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Company Values</CardTitle>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add value..."
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddValue();
                            }
                          }}
                          className="w-40"
                        />
                        <Button size="sm" onClick={handleAddValue}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {values.length === 0 ? (
                    <p className="text-muted-foreground">No company values added yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {values.map((value, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-base py-2 px-4"
                        >
                          {value}
                          {isEditing && (
                            <X
                              className="w-3 h-3 ml-2 cursor-pointer"
                              onClick={() => handleRemoveValue(value)}
                            />
                          )}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Benefits Tab */}
            <TabsContent value="benefits">
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Employee Benefits</CardTitle>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add benefit..."
                          value={newBenefit}
                          onChange={(e) => setNewBenefit(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddBenefit();
                            }
                          }}
                          className="w-40"
                        />
                        <Button size="sm" onClick={handleAddBenefit}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {benefits.length === 0 ? (
                    <p className="text-muted-foreground">No benefits added yet</p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-3">
                      {benefits.map((benefit, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <span className="text-sm">{benefit}</span>
                          {isEditing && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveBenefit(benefit)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Branding Tab */}
            <TabsContent value="branding">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Company Branding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Logo URL</Label>
                    {isEditing ? (
                      <Input
                        placeholder="https://yourcompany.com/logo.png"
                        value={formData.logo_url}
                        onChange={(e) =>
                          setFormData({ ...formData, logo_url: e.target.value })
                        }
                      />
                    ) : (
                      <div className="flex items-center gap-4">
                        {formData.logo_url ? (
                          <img
                            src={formData.logo_url}
                            alt="Company Logo"
                            className="w-16 h-16 rounded-lg object-cover border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center">
                            <Building className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {formData.logo_url || "No logo uploaded"}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CompanyProfile;
