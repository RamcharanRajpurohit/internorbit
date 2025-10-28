import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { Save } from "lucide-react";
import { internshipAPI } from "@/lib/api";
import { getSession } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/Loader";


const CreateInternship = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    location: "",
    is_remote: false,
    stipend_min: "",
    stipend_max: "",
    duration_months: "",
    skills_required: "",
    positions_available: "1",
    application_deadline: "",
    status: "active" as const,
  });

  useEffect(() => {
    if (id) {
      loadInternship(id);
    }
  }, [id]);

 const loadInternship = async (internshipId: string) => {
  try {
    // CHANGED: Use backend API instead of supabase
    const response = await internshipAPI.getById(internshipId);
    const data = response.internship;

    if (data) {
      setFormData({
        title: data.title || "",
        description: data.description || "",
        requirements: data.requirements || "",
        responsibilities: data.responsibilities || "",
        location: data.location || "",
        is_remote: data.is_remote || false,
        stipend_min: data.stipend_min?.toString() || "",
        stipend_max: data.stipend_max?.toString() || "",
        duration_months: data.duration_months?.toString() || "",
        skills_required: data.skills_required?.join(", ") || "",
        positions_available: data.positions_available?.toString() || "1",
        application_deadline: data.application_deadline || "",
        status: (data.status as "active") || "active",
      });
    }
  } catch (error: any) {
    toast.error("Failed to load internship");
    navigate("/company/internships");
  } finally {
    setLoading(false);
  }
};

const handleSave = async () => {
  if (!formData.title || !formData.description) {
    toast.error("Please fill in all required fields");
    return;
  }

  setSaving(true);
  try {
    const skillsArray = formData.skills_required
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    const internshipData = {
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements,
      responsibilities: formData.responsibilities,
      location: formData.location,
      is_remote: formData.is_remote,
      stipend_min: formData.stipend_min ? parseInt(formData.stipend_min) : null,
      stipend_max: formData.stipend_max ? parseInt(formData.stipend_max) : null,
      duration_months: formData.duration_months
        ? parseInt(formData.duration_months)
        : null,
      skills_required: skillsArray,
      positions_available: parseInt(formData.positions_available),
      application_deadline: formData.application_deadline || null,
      status: formData.status,
    };

    if (id) {
      // CHANGED: Use backend API instead of supabase
      await internshipAPI.update(id, internshipData);
      toast.success("Internship updated successfully!");
    } else {
      // CHANGED: Use backend API instead of supabase
      await internshipAPI.create(internshipData);
      toast.success("Internship created successfully!");
    }

    navigate("/company/internships");
  } catch (error: any) {
    toast.error(error.message || "Failed to save internship");
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Loader/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="company" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              {id ? "Edit Internship" : "Create New Internship"}
            </h1>
            <p className="text-muted-foreground">
              Post an internship opportunity for students
            </p>
          </div>

          <Card className="p-8 shadow-card">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Position Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Software Engineer Intern"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
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
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the internship opportunity..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={5}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    placeholder="What will the intern be doing?"
                    value={formData.responsibilities}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        responsibilities: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="What should the intern know/have?"
                    value={formData.requirements}
                    onChange={(e) =>
                      setFormData({ ...formData, requirements: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stipend_min">Stipend Min ($)</Label>
                  <Input
                    id="stipend_min"
                    type="number"
                    placeholder="0"
                    value={formData.stipend_min}
                    onChange={(e) =>
                      setFormData({ ...formData, stipend_min: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stipend_max">Stipend Max ($)</Label>
                  <Input
                    id="stipend_max"
                    type="number"
                    placeholder="0"
                    value={formData.stipend_max}
                    onChange={(e) =>
                      setFormData({ ...formData, stipend_max: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (months)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="3"
                    value={formData.duration_months}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_months: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="positions">Positions Available</Label>
                  <Input
                    id="positions"
                    type="number"
                    placeholder="1"
                    value={formData.positions_available}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        positions_available: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Required Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  placeholder="React, Node.js, SQL, etc."
                  value={formData.skills_required}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      skills_required: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        application_deadline: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remote">Remote</Label>
                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_remote}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_remote: e.target.checked,
                          })
                        }
                      />
                      <span>Fully Remote</span>
                    </label>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gradient-primary hover:shadow-glow transition-all"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving
                  ? "Saving..."
                  : id
                  ? "Update Internship"
                  : "Create Internship"}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateInternship;