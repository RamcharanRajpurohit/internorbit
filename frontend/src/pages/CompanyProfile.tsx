import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { Save } from "lucide-react";
import { companyProfileAPI } from "@/lib/api";
import { getSession } from "@/integrations/supabase/client";


const CompanyProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    description: "",
    website: "",
    industry: "",
    company_size: "",
    location: "",
    logo_url: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

 const loadProfile = async () => {
  try {
    const session = await getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // CHANGED: Use backend API instead of supabase
    const response = await companyProfileAPI.getProfile();
    const data = response.profile;

    if (data) {
      setFormData({
        company_name: data.company_name || "",
        description: data.description || "",
        website: data.website || "",
        industry: data.industry || "",
        company_size: data.company_size || "",
        location: data.location || "",
        logo_url: data.logo_url || "",
      });
    }
  } catch (error: any) {
    // Profile doesn't exist yet, that's ok
    console.log("No profile yet");
  } finally {
    setLoading(false);
  }
};

const handleSave = async () => {
  setSaving(true);
  try {
    // CHANGED: Use backend API instead of supabase
    const response = await companyProfileAPI.updateProfile({
      company_name: formData.company_name,
      description: formData.description,
      website: formData.website,
      industry: formData.industry,
      company_size: formData.company_size,
      location: formData.location,
      logo_url: formData.logo_url,
    });

    if (response.profile) {
      toast.success("Company profile saved successfully!");
    }
  } catch (error: any) {
    toast.error(error.message || "Failed to save profile");
  } finally {
    setSaving(false);
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
      <Navigation role="company" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Company Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your company information
            </p>
          </div>

          <Card className="p-8 shadow-card">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  placeholder="Your Company"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Technology"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_size">Company Size</Label>
                  <Input
                    id="company_size"
                    placeholder="e.g., 50-100"
                    value={formData.company_size}
                    onChange={(e) =>
                      setFormData({ ...formData, company_size: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://yourcompany.com"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell students about your company..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  placeholder="https://yourcompany.com/logo.png"
                  value={formData.logo_url}
                  onChange={(e) =>
                    setFormData({ ...formData, logo_url: e.target.value })
                  }
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gradient-primary hover:shadow-glow transition-all"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CompanyProfile;
