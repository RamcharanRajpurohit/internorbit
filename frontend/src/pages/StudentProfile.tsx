// src/pages/StudentProfile.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentProfileAPI } from "@/lib/api";
import { getSession } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { Upload, Save } from "lucide-react";

const StudentProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    bio: "",
    university: "",
    degree: "",
    graduation_year: new Date().getFullYear(),
    location: "",
    skills: "",
    linkedin_url: "",
    github_url: "",
    phone: "",
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
    const response = await studentProfileAPI.getProfile();
    const data = response.profile;

    if (data) {
      setProfile(data);
      setFormData({
        bio: data.bio || "",
        university: data.university || "",
        degree: data.degree || "",
        graduation_year: data.graduation_year || new Date().getFullYear(),
        location: data.location || "",
        skills: data.skills?.join(", ") || "",
        linkedin_url: data.linkedin_url || "",
        github_url: data.github_url || "",
        phone: data.phone || "",
      });
    }
  } catch (error: any) {
    toast.error("Failed to load profile");
  } finally {
    setLoading(false);
  }
};

const handleSave = async () => {
  setSaving(true);
  try {
    const skillsArray = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    // CHANGED: Use backend API instead of supabase
    const response = await studentProfileAPI.updateProfile({
      bio: formData.bio,
      university: formData.university,
      degree: formData.degree,
      graduation_year: formData.graduation_year,
      location: formData.location,
      skills: skillsArray,
      linkedin_url: formData.linkedin_url,
      github_url: formData.github_url,
      phone: formData.phone,
    });

    if (response.profile) {
      toast.success("Profile saved successfully!");
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
      <Navigation role="student" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Your Profile
            </h1>
            <p className="text-muted-foreground">
              Complete your profile to get better internship matches
            </p>
          </div>

          <Card className="p-8 shadow-card">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    placeholder="Your University"
                    value={formData.university}
                    onChange={(e) =>
                      setFormData({ ...formData, university: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    placeholder="e.g., Computer Science"
                    value={formData.degree}
                    onChange={(e) =>
                      setFormData({ ...formData, degree: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="graduation">Graduation Year</Label>
                  <Input
                    id="graduation"
                    type="number"
                    value={formData.graduation_year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        graduation_year: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  placeholder="React, Python, Figma, etc."
                  value={formData.skills}
                  onChange={(e) =>
                    setFormData({ ...formData, skills: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell companies about yourself..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/yourname"
                    value={formData.linkedin_url}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedin_url: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  placeholder="https://github.com/yourname"
                  value={formData.github_url}
                  onChange={(e) =>
                    setFormData({ ...formData, github_url: e.target.value })
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

export default StudentProfile;

// src/pages/SavedInternships.tsx


// src/pages/Applications.tsx


// src/pages/CompanyProfile.tsx

// src/pages/CompanyInternships.tsx


