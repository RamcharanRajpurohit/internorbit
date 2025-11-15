// frontend/src/pages/StudentProfile.tsx - ENHANCED VERSION
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { useRouteRefresh } from "@/hooks/useRouteRefresh";
import { useStudentProfile } from "@/hooks/useProfile";
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
  Save, Upload, Edit, X, Plus, Trash2,
  User, GraduationCap, Briefcase, FileText,
  Phone, MapPin, Calendar,
  Link as LinkIcon, Mail, Globe, Download, Eye
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { resumeAPI } from "@/lib/api";
import { ResumeUploader } from "@/components/student/ResumeUploader";
import type { Resume } from "@/types";


// Backend API response type
interface BackendProject {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  project_url?: string;
  github_url?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
}

// Frontend display type
interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  url?: string;
  github_url?: string;
}

// Backend API response type
interface BackendExperience {
  _id: string;
  company_name: string;
  position: string;
  description?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
}

// Frontend display type
interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date?: string;
  description: string;
  current: boolean;
}

// Data transformation utilities

const mapBackendProjectToFrontend = (backendProject: BackendProject): Project => ({
  id: backendProject._id,
  title: backendProject.title,
  description: backendProject.description,
  tech_stack: backendProject.technologies,
  url: backendProject.project_url,
  github_url: backendProject.github_url,
});

const mapBackendExperienceToFrontend = (backendExperience: BackendExperience): Experience => ({
  id: backendExperience._id,
  title: backendExperience.position,
  company: backendExperience.company_name,
  location: backendExperience.location || "",
  start_date: backendExperience.start_date,
  end_date: backendExperience.end_date,
  description: backendExperience.description || "",
  current: backendExperience.is_current,
});

const StudentProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);

  // Use our new state management hooks
  const { isAuthenticated, isStudent } = useAuth();
  
  // Detect browser refresh and refetch data
  useRouteRefresh(isStudent ? 'student' : null);
  
  const {
    studentProfile: profile,
    isLoading,
    isUpdating,
    error,
    updateProfile,
    refetch,
  } = useStudentProfile();

  const [saving, setSaving] = useState(false);
  
  // Basic Info (including editable name)
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    university: "",
    degree: "",
    graduation_year: new Date().getFullYear(),
    location: "",
    phone: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    avatar_url: "",
  });

  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // Resumes - use from Redux state instead of local state
  const resumes = (profile?.resumes || []) as Resume[];
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Resume preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResume, setPreviewResume] = useState<any>(null);

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Experience
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [showExperienceDialog, setShowExperienceDialog] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!isAuthenticated || !isStudent) {
      navigate("/auth");
    }
  }, [isAuthenticated, isStudent, navigate]);

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.user?.full_name || "",
        bio: profile.bio || "",
        university: profile.university || "",
        degree: profile.degree || "",
        graduation_year: profile.graduation_year || new Date().getFullYear(),
        location: profile.location || "",
        phone: profile.phone || "",
        linkedin_url: profile.linkedin_url || "",
        github_url: profile.github_url || "",
        portfolio_url: profile.portfolio_url || "",
        avatar_url: profile.avatar_url || "",
      });

      setSkills(profile.skills || []);
      setProjects((profile.projects || []).map(mapBackendProjectToFrontend));
      setExperiences((profile.experiences || []).map(mapBackendExperienceToFrontend));
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Extract full_name separately as it goes to auth endpoint
      const { full_name, ...studentProfileData } = formData;
      
      // Update student profile
      await updateProfile({
        ...studentProfileData,
        skills,
        projects,
        experiences,
        // Resumes are managed separately via resume endpoints, not here
      });

      // Update name via auth endpoint if changed
      if (full_name && full_name !== profile?.user?.full_name) {
        const { authAPI } = await import('@/lib/api');
        await authAPI.updateProfile({ full_name });
        
        // Force Redux auth state refresh to sync the new name
        const { checkAuth } = await import('@/store/slices/authSlice');
        await dispatch(checkAuth(undefined));
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      
      // Refetch to get updated data
      await refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Skills Management
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // Resume Management (PDF-based)
  const handleSetPrimaryResume = async (resumeId: string) => {
    try {
      await resumeAPI.setPrimary(resumeId);
      // Reload resumes from Redux
      await refetch();
      toast.success("Primary resume updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to set primary resume");
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      await resumeAPI.deleteResume(resumeId);
      // Reload resumes from Redux
      await refetch();
      toast.success("Resume deleted!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete resume");
    }
  };

  const handleResumeUploadSuccess = async (newResume: Resume) => {
    // Reload resumes from Redux to get the latest state
    await refetch();
    setShowUploadDialog(false);
    toast.success("Resume uploaded successfully!");
  };

  // Resume viewing functions (matching application page pattern)
  const handleViewResume = async (resume: Resume) => {
    try {
      setPreviewResume(resume);
      setPreviewLoading(true);
      setPreviewOpen(true);

      const token = await (await import('@/integrations/supabase/client')).getAuthToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URI}/resume/${resume._id}/access`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ access_type: 'view' }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      setPreviewUrl(data.signed_url);
    } catch (error: any) {
      toast.error('Failed to load resume');
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadResume = async (resume: Resume) => {
    try {
      const token = await (await import('@/integrations/supabase/client')).getAuthToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URI}/resume/${resume._id}/access`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ access_type: 'download' }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();

      const link = document.createElement('a');
      link.href = data.signed_url;
      link.download = resume.file_name || 'resume.pdf';
      link.click();

      toast.success('Resume downloaded');
    } catch (error: any) {
      toast.error('Failed to download resume');
    }
  };

  // Project Management
  const handleSaveProject = (project: Project) => {
    if (editingProject) {
      setProjects(projects.map((p) => (p.id === project.id ? project : p)));
      toast.success("Project updated!");
    } else {
      setProjects([...projects, { ...project, id: Date.now().toString() }]);
      toast.success("Project added!");
    }
    setShowProjectDialog(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
    toast.success("Project deleted");
  };

  // Experience Management
  const handleSaveExperience = (experience: Experience) => {
    if (editingExperience) {
      setExperiences(experiences.map((e) => (e.id === experience.id ? experience : e)));
      toast.success("Experience updated!");
    } else {
      setExperiences([...experiences, { ...experience, id: Date.now().toString() }]);
      toast.success("Experience added!");
    }
    setShowExperienceDialog(false);
    setEditingExperience(null);
  };

  const handleDeleteExperience = (id: string) => {
    setExperiences(experiences.filter((e) => e.id !== id));
    toast.success("Experience deleted");
  };

  // Remove full-page loader - show content with skeleton loaders
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="student" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-gradient-card rounded-2xl p-4 sm:p-8 border border-border shadow-card">
              {isLoading ? (
                // Skeleton loader for profile header
                <div className="animate-pulse">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-3 text-center md:text-left w-full">
                      <div className="h-8 bg-muted rounded w-48 mx-auto md:mx-0"></div>
                      <div className="h-4 bg-muted rounded w-32 mx-auto md:mx-0"></div>
                      <div className="h-12 bg-muted rounded w-full"></div>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <div className="h-8 bg-muted rounded w-24"></div>
                        <div className="h-8 bg-muted rounded w-24"></div>
                        <div className="h-8 bg-muted rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
                <div className="relative">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 ring-4 ring-border shadow-lg">
                    <AvatarImage src={formData.avatar_url} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl sm:text-3xl">
                      {profile?.user?.full_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary shadow-lg"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left min-w-0">
                  <div className="mb-2">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1 break-words">
                      {isEditing ? formData.full_name : (profile?.user?.full_name || "Profile")}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground flex items-center justify-center md:justify-start gap-2 flex-wrap break-all">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="break-all">{profile?.user?.email}</span>
                    </p>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 break-words">
                    {formData.degree} {formData.university && `at ${formData.university}`}
                  </p>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-3 sm:gap-4 justify-center md:justify-start text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      <span className="font-medium">{experiences.length} Experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      <span className="font-medium">{projects.length} Projects</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      <span className="font-medium">{resumes.length} Resumes</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  disabled={saving}
                  className="bg-gradient-primary hover:shadow-glow transition-all px-4 sm:px-6 py-2 sm:py-3 w-full md:w-auto text-sm sm:text-base"
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
            <div className="overflow-x-auto -mx-4 px-4">
              <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-5 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="overview" className="flex-shrink-0 rounded-lg whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="education" className="flex-shrink-0 rounded-lg whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">
                  <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Education
                </TabsTrigger>
                <TabsTrigger value="experience" className="flex-shrink-0 rounded-lg whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Experience
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex-shrink-0 rounded-lg whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Projects
                </TabsTrigger>
                <TabsTrigger value="resumes" className="flex-shrink-0 rounded-lg whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Resumes
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* About Section */}
                <div className="lg:col-span-2">
                  <Card className="shadow-card h-full">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        About Me
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <Textarea
                          placeholder="Tell companies about yourself..."
                          value={formData.bio}
                          onChange={(e) =>
                            setFormData({ ...formData, bio: e.target.value })
                          }
                          rows={6}
                          className="w-full resize-none border-muted bg-muted/50 focus:bg-background transition-colors"
                        />
                      ) : (
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line min-h-[150px]">
                          {formData.bio || "No bio added yet. Tell companies about yourself, your goals, and what makes you a great candidate!"}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Contact Info */}
                <Card className="shadow-card h-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Personal Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>
                          <User className="w-4 h-4 inline mr-2" />
                          Full Name
                        </Label>
                        {isEditing ? (
                          <Input
                            placeholder="Your full name"
                            value={formData.full_name}
                            onChange={(e) =>
                              setFormData({ ...formData, full_name: e.target.value })
                            }
                          />
                        ) : (
                          <p className="text-muted-foreground font-medium">
                            {formData.full_name || "Not provided"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>
                          <Phone className="w-4 h-4 inline mr-2" />
                          Phone
                        </Label>
                        {isEditing ? (
                          <Input
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                          />
                        ) : (
                          <p className="text-muted-foreground">
                            {formData.phone || "Not provided"}
                          </p>
                        )}
                      </div>

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
                          <Globe className="w-4 h-4 inline mr-2" />
                          LinkedIn
                        </Label>
                        {isEditing ? (
                          <Input
                            placeholder="https://linkedin.com/in/yourname"
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
                            View Profile
                          </a>
                        ) : (
                          <p className="text-muted-foreground">Not provided</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>
                          <FileText className="w-4 h-4 inline mr-2" />
                          GitHub
                        </Label>
                        {isEditing ? (
                          <Input
                            placeholder="https://github.com/yourname"
                            value={formData.github_url}
                            onChange={(e) =>
                              setFormData({ ...formData, github_url: e.target.value })
                            }
                          />
                        ) : formData.github_url ? (
                          <a
                            href={formData.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-2"
                          >
                            <LinkIcon className="w-4 h-4" />
                            View Profile
                          </a>
                        ) : (
                          <p className="text-muted-foreground">Not provided</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Section */}
                <Card className="shadow-card h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        Skills
                      </CardTitle>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add skill..."
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddSkill();
                              }
                            }}
                            className="w-32 h-8"
                          />
                          <Button size="sm" onClick={handleAddSkill} className="h-8 px-3">
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {skills.length === 0 ? (
                      <div className="text-center py-8">
                        
                        <p className="text-muted-foreground text-sm">
                          Add your technical and soft skills to showcase your expertise
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-sm py-1.5 px-3 hover:bg-primary/80 transition-colors"
                          >
                            {skill}
                            {isEditing && (
                              <X
                                className="w-3 h-3 ml-1.5 cursor-pointer hover:text-destructive"
                                onClick={() => handleRemoveSkill(skill)}
                              />
                            )}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>University</Label>
                      {isEditing ? (
                        <Input
                          placeholder="Your University"
                          value={formData.university}
                          onChange={(e) =>
                            setFormData({ ...formData, university: e.target.value })
                          }
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          {formData.university || "Not provided"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Degree</Label>
                      {isEditing ? (
                        <Input
                          placeholder="e.g., Computer Science"
                          value={formData.degree}
                          onChange={(e) =>
                            setFormData({ ...formData, degree: e.target.value })
                          }
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          {formData.degree || "Not provided"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Graduation Year
                      </Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.graduation_year}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              graduation_year: parseInt(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          {formData.graduation_year}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Experience Tab - Placeholder for now */}
            <TabsContent value="experience">
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Work Experience</CardTitle>
                    {isEditing && (
                      <Button size="sm" onClick={() => setShowExperienceDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Experience
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {experiences.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No work experience added yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {experiences.map((exp) => (
                        <div
                          key={exp.id}
                          className="p-4 border rounded-lg space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{exp.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {exp.company} • {exp.location}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {exp.start_date} - {exp.current ? "Present" : exp.end_date}
                              </p>
                            </div>
                            {isEditing && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteExperience(exp.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab - Placeholder */}
            <TabsContent value="projects">
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Projects</CardTitle>
                    {isEditing && (
                      <Button size="sm" onClick={() => setShowProjectDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Project
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {projects.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No projects added yet
                    </p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className="p-4 border rounded-lg space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold">{project.title}</h3>
                            {isEditing && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteProject(project.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {project.tech_stack.map((tech, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                          {(project.url || project.github_url) && (
                            <div className="flex gap-2">
                              {project.url && (
                                <a
                                  href={project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  Live Demo →
                                </a>
                              )}
                              {project.github_url && (
                                <a
                                  href={project.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  GitHub →
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resumes Tab */}
            <TabsContent value="resumes">
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-lg sm:text-xl">Resumes</CardTitle>
                    <div className="flex gap-2">
                      {isEditing && (
                        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="w-full sm:w-auto">
                              <Plus className="w-4 h-4 mr-2" />
                              Upload Resume
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Upload Resume</DialogTitle>
                            </DialogHeader>
                            <ResumeUploader
                              open={true}
                              onOpenChange={setShowUploadDialog}
                              onSuccess={handleResumeUploadSuccess}
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {resumes.length === 0 ? (
                    <div className="text-center py-12">
                      <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm sm:text-base text-muted-foreground mb-4">
                        No resumes uploaded yet
                      </p>
                      {isEditing && (
                        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                          <DialogTrigger asChild>
                            <Button className="bg-gradient-primary w-full sm:w-auto">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Your First Resume
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Upload Resume</DialogTitle>
                            </DialogHeader>
                            <ResumeUploader
                              open={true}
                              onOpenChange={setShowUploadDialog}
                              onSuccess={handleResumeUploadSuccess}
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {resumes.map((resume) => (
                        <div
                          key={resume._id}
                          className="flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg hover:border-primary transition-colors bg-background"
                        >
                          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 sm:mt-0" />
                            <div className="min-w-0 flex-1">
                              <p 
                                className="text-xs sm:text-sm font-medium truncate" 
                                title={resume.file_name}
                              >
                                {resume.file_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(resume.uploaded_at).toLocaleDateString()}
                                {resume.is_primary && ' • Primary'}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewResume(resume)}
                              className="flex-shrink-0 h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadResume(resume)}
                              className="flex-shrink-0 h-8 w-8 p-0"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            {isEditing && (
                              <>
                                {!resume.is_primary && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSetPrimaryResume(resume._id)}
                                    className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap"
                                  >
                                    Set Primary
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteResume(resume._id)}
                                  className="flex-shrink-0 h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Resume Preview Dialog */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="w-[95vw] max-w-4xl h-[90vh] sm:max-h-[90vh] flex flex-col p-0">
              <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b">
                <DialogTitle className="text-base sm:text-lg pr-8">
                  Resume Preview
                  {previewResume && (
                    <p className="text-xs text-muted-foreground mt-1 truncate" title={previewResume.file_name}>
                      {previewResume.file_name}
                    </p>
                  )}
                </DialogTitle>
              </DialogHeader>
              {previewLoading ? (
                <div className="flex items-center justify-center flex-1 min-h-[300px]">
                  <Loader />
                </div>
              ) : previewUrl ? (
                <div className="flex-1 overflow-hidden">
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title="Resume Preview"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center flex-1 min-h-[300px] p-4">
                  <p className="text-sm sm:text-base text-muted-foreground">Failed to load resume</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;