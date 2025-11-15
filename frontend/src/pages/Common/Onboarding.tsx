// frontend/src/pages/Onboarding.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { studentProfileAPI, companyProfileAPI, authAPI } from "@/lib/api";
import { useDispatch } from "react-redux";
import { checkAuth } from "@/store/slices/authSlice";
import { AppDispatch } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Briefcase,
  GraduationCap,
  Building2,
  Sparkles,
  Loader2
} from "lucide-react";

interface OnboardingProps {
  userRole: "student" | "company";
}

const Onboarding = ({ userRole }: OnboardingProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Redirect if user has already completed onboarding
  useEffect(() => {
    if (user && user.onboarding_completed === true) {
      toast.info("You've already completed onboarding");
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

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
    company_size: "1-10" as any,
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

  const handleSkip = async () => {
    setLoading(true);
    try {
      // Mark onboarding as completed (skipped) so user won't see it again
      await authAPI.updateProfile({ onboarding_completed: true });
      
      // Refresh Redux state to get updated user data
      await dispatch(checkAuth(undefined)).unwrap();
      
      toast.info("You can complete your profile later from settings");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Skip error:", error);
      toast.error("Failed to skip onboarding");
    } finally {
      setLoading(false);
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

      // Mark onboarding as completed
      await authAPI.updateProfile({ onboarding_completed: true });
      
      // Refresh Redux state to get updated user data
      await dispatch(checkAuth(undefined)).unwrap();

      toast.success("Profile setup complete! 🎉");
      navigate("/", { replace: true });
    } catch (error: any) {
      console.error('Onboarding completion error:', error);
      
      // Show the actual error message from backend
      const errorMessage = error.message || error.error || 'Failed to complete setup';
      toast.error(errorMessage, {
        description: 'Please check all fields and try again',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStudentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                Tell us about yourself
              </h2>
              <p className="text-muted-foreground">Help companies get to know you better</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-base font-semibold">Bio *</Label>
                <Textarea
                  id="bio"
                  placeholder="Share your passion, experience, and what makes you unique... (min 50 characters)"
                  value={studentData.bio}
                  onChange={(e) =>
                    setStudentData({ ...studentData, bio: e.target.value })
                  }
                  rows={5}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  {studentData.bio.length}/50 characters
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-semibold">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={studentData.phone}
                    onChange={(e) =>
                      setStudentData({ ...studentData, phone: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base font-semibold">Location *</Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    value={studentData.location}
                    onChange={(e) =>
                      setStudentData({ ...studentData, location: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                Your Education
              </h2>
              <p className="text-muted-foreground">Share your academic background</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="university" className="text-base font-semibold">University *</Label>
                  <Input
                    id="university"
                    placeholder="Your University"
                    value={studentData.university}
                    onChange={(e) =>
                      setStudentData({ ...studentData, university: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="degree" className="text-base font-semibold">Degree *</Label>
                  <Input
                    id="degree"
                    placeholder="e.g., Computer Science"
                    value={studentData.degree}
                    onChange={(e) =>
                      setStudentData({ ...studentData, degree: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grad_year" className="text-base font-semibold">Graduation Year *</Label>
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
                  className="h-11"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-base font-semibold">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/yourname"
                    value={studentData.linkedin_url}
                    onChange={(e) =>
                      setStudentData({ ...studentData, linkedin_url: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github" className="text-base font-semibold">GitHub URL</Label>
                  <Input
                    id="github"
                    placeholder="https://github.com/yourname"
                    value={studentData.github_url}
                    onChange={(e) =>
                      setStudentData({ ...studentData, github_url: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                Your Skills
              </h2>
              <p className="text-muted-foreground">Add skills that make you stand out</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Add Skills *</Label>
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
                    className="h-11"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddSkill}
                    className="bg-gradient-primary hover:shadow-glow transition-all"
                  >
                    Add
                  </Button>
                </div>
              </div>
              
              {studentData.skills.length > 0 && (
                <div className="p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border">
                  <div className="flex flex-wrap gap-2">
                    {studentData.skills.map((skill, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-base py-2 px-4 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => handleRemoveSkill(idx)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground text-center">
                💡 Click on a skill to remove it
              </p>
            </div>
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
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                Company Information
              </h2>
              <p className="text-muted-foreground">Tell students about your company</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name" className="text-base font-semibold">Company Name *</Label>
                <Input
                  id="company_name"
                  placeholder="Your Company"
                  value={companyData.company_name}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, company_name: e.target.value })
                  }
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Tell students about your company, culture, and mission... (min 50 characters)"
                  value={companyData.description}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, description: e.target.value })
                  }
                  rows={5}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  {companyData.description.length}/50 characters
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-base font-semibold">Industry *</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Technology"
                    value={companyData.industry}
                    onChange={(e) =>
                      setCompanyData({ ...companyData, industry: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_size" className="text-base font-semibold">Company Size *</Label>
                  <select
                    id="company_size"
                    value={companyData.company_size}
                    onChange={(e) =>
                      setCompanyData({ ...companyData, company_size: e.target.value as any })
                    }
                    className="w-full h-11 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                Additional Details
              </h2>
              <p className="text-muted-foreground">Complete your company profile</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base font-semibold">Location *</Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    value={companyData.location}
                    onChange={(e) =>
                      setCompanyData({ ...companyData, location: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-base font-semibold">Website *</Label>
                  <Input
                    id="website"
                    placeholder="https://yourcompany.com"
                    value={companyData.website}
                    onChange={(e) =>
                      setCompanyData({ ...companyData, website: e.target.value })
                    }
                    className="h-11"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo_url" className="text-base font-semibold">Logo URL</Label>
                <Input
                  id="logo_url"
                  placeholder="https://yourcompany.com/logo.png"
                  value={companyData.logo_url}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, logo_url: e.target.value })
                  }
                  className="h-11"
                />
                <p className="text-sm text-muted-foreground">
                  Optional: Add a URL to your company logo
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              InternOrbit
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Skipping...
              </>
            ) : (
              "Skip for now"
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <Card className="w-full max-w-3xl shadow-elevated border border-border">
          <CardContent className="p-8 md:p-12">
            {/* Progress */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold bg-gradient-primary bg-clip-text text-transparent">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm text-muted-foreground font-medium">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-2.5" />
            </div>

            {/* Content */}
            {userRole === "student" ? renderStudentStep() : renderCompanyStep()}

            {/* Navigation */}
            <div className="flex gap-4 mt-10">
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  className="h-12 px-6 border-2"
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              {currentStep < totalSteps ? (
                <Button 
                  onClick={handleNext} 
                  className="flex-1 h-12 text-lg bg-gradient-primary hover:shadow-glow transition-all"
                  disabled={loading}
                >
                  Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 h-12 text-lg bg-gradient-primary hover:shadow-glow transition-all"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {loading ? "Completing..." : "Complete Setup"}
                </Button>
              )}
            </div>
            
            {/* Helper Text */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Fields marked with * are required
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;