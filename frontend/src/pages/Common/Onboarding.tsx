// frontend/src/pages/Onboarding.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { studentProfileAPI, companyProfileAPI } from "@/lib/api";
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

interface OnboardingProps {
  userRole: "student" | "company";
}

const Onboarding = ({ userRole }: OnboardingProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Student data
  const [studentData, setStudentData] = useState({
    bio: "",
    university: "",
    degree: "",
    graduation_year: new Date().getFullYear(),
    location: "",
    skills: [] as string[],
    skillInput: "",
    linkedin_url: "",
    github_url: "",
    phone: "",
  });

  // Company data
  const [companyData, setCompanyData] = useState({
    company_name: "",
    description: "",
    website: "",
    industry: "",
    company_size: "",
    location: "",
    logo_url: "",
  });

  const totalSteps = userRole === "student" ? 3 : 2;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddSkill = () => {
    if (studentData.skillInput.trim()) {
      setStudentData({
        ...studentData,
        skills: [...studentData.skills, studentData.skillInput.trim()],
        skillInput: "",
      });
    }
  };

  const handleRemoveSkill = (index: number) => {
    setStudentData({
      ...studentData,
      skills: studentData.skills.filter((_, i) => i !== index),
    });
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      if (userRole === "student") {
        await studentProfileAPI.createProfile({
          bio: studentData.bio,
          university: studentData.university,
          degree: studentData.degree,
          graduation_year: studentData.graduation_year,
          location: studentData.location,
          skills: studentData.skills,
          linkedin_url: studentData.linkedin_url,
          github_url: studentData.github_url,
          phone: studentData.phone,
        });
      } else {
        await companyProfileAPI.createProfile({
          company_name: companyData.company_name,
          description: companyData.description,
          website: companyData.website,
          industry: companyData.industry,
          company_size: companyData.company_size,
          location: companyData.location,
          logo_url: companyData.logo_url,
        });
      }

      toast.success("Profile setup complete!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete setup");
    } finally {
      setLoading(false);
    }
  };

  const renderStudentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Tell us about yourself</h2>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell companies about yourself..."
                value={studentData.bio}
                onChange={(e) =>
                  setStudentData({ ...studentData, bio: e.target.value })
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
                  value={studentData.phone}
                  onChange={(e) =>
                    setStudentData({ ...studentData, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={studentData.location}
                  onChange={(e) =>
                    setStudentData({ ...studentData, location: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Education</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  placeholder="Your University"
                  value={studentData.university}
                  onChange={(e) =>
                    setStudentData({ ...studentData, university: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="degree">Degree</Label>
                <Input
                  id="degree"
                  placeholder="e.g., Computer Science"
                  value={studentData.degree}
                  onChange={(e) =>
                    setStudentData({ ...studentData, degree: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grad_year">Graduation Year</Label>
              <Input
                id="grad_year"
                type="number"
                value={studentData.graduation_year}
                onChange={(e) =>
                  setStudentData({
                    ...studentData,
                    graduation_year: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/yourname"
                  value={studentData.linkedin_url}
                  onChange={(e) =>
                    setStudentData({ ...studentData, linkedin_url: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  placeholder="https://github.com/yourname"
                  value={studentData.github_url}
                  onChange={(e) =>
                    setStudentData({ ...studentData, github_url: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Your Skills</h2>
            <div className="space-y-2">
              <Label>Add Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., React, Python, Design..."
                  value={studentData.skillInput}
                  onChange={(e) =>
                    setStudentData({ ...studentData, skillInput: e.target.value })
                  }
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddSkill}>
                  Add
                </Button>
              </div>
            </div>
            {studentData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {studentData.skills.map((skill, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-base py-2 px-4 cursor-pointer"
                    onClick={() => handleRemoveSkill(idx)}
                  >
                    {skill} ×
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Click on a skill to remove it
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const renderCompanyStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Company Information</h2>
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                placeholder="Your Company"
                value={companyData.company_name}
                onChange={(e) =>
                  setCompanyData({ ...companyData, company_name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell students about your company..."
                value={companyData.description}
                onChange={(e) =>
                  setCompanyData({ ...companyData, description: e.target.value })
                }
                rows={4}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Technology"
                  value={companyData.industry}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, industry: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_size">Company Size</Label>
                <Input
                  id="company_size"
                  placeholder="e.g., 50-100"
                  value={companyData.company_size}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, company_size: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Additional Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={companyData.location}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, location: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://yourcompany.com"
                  value={companyData.website}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, website: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                placeholder="https://yourcompany.com/logo.png"
                value={companyData.logo_url}
                onChange={(e) =>
                  setCompanyData({ ...companyData, logo_url: e.target.value })
                }
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-elevated">
        <CardContent className="p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Content */}
          {userRole === "student" ? renderStudentStep() : renderCompanyStep()}

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="flex-1 bg-gradient-primary">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 bg-gradient-primary"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {loading ? "Completing..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;