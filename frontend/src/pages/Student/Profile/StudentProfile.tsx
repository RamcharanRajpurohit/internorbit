// frontend/src/pages/StudentProfile.tsx - ENHANCED VERSION
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentProfileAPI } from "@/lib/api";
import { getSession } from "@/integrations/supabase/client";
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
import Navigation from "@/components/Navigation";
import { 
  Save, Upload, Edit, X, Plus, Trash2, 
  User, GraduationCap, Briefcase, FileText, 
  Linkedin, Github, Phone, MapPin, Calendar,
  Link as LinkIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Resume {
  id: string;
  name: string;
  url: string;
  uploaded_at: string;
  is_primary: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  url?: string;
  github_url?: string;
}

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

const StudentProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  // Basic Info
  const [formData, setFormData] = useState({
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

  // Resumes
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [newResumeName, setNewResumeName] = useState("");
  const [newResumeUrl, setNewResumeUrl] = useState("");
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Experience
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [showExperienceDialog, setShowExperienceDialog] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

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

      const response = await studentProfileAPI.getProfile();
      console.log("Student",response);
      
      const data = response.profile;

      if (data) {
        setProfile(data);
        setFormData({
          bio: data.bio || "",
          university: data.university || "",
          degree: data.degree || "",
          graduation_year: data.graduation_year || new Date().getFullYear(),
          location: data.location || "",
          phone: data.phone || "",
          linkedin_url: data.linkedin_url || "",
          github_url: data.github_url || "",
          portfolio_url: data.portfolio_url || "",
          avatar_url: data.avatar_url || "",
        });
        setSkills(data.skills || []);
        setResumes(data.resumes || []);
        setProjects(data.projects || []);
        setExperiences(data.experiences || []);
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await studentProfileAPI.updateProfile({
        ...formData,
        skills,
        resumes,
        projects,
        experiences,
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      loadProfile();
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

  // Resume Management
  const handleAddResume = () => {
    if (newResumeName.trim() && newResumeUrl.trim()) {
      const newResume: Resume = {
        id: Date.now().toString(),
        name: newResumeName,
        url: newResumeUrl,
        uploaded_at: new Date().toISOString(),
        is_primary: resumes.length === 0,
      };
      setResumes([...resumes, newResume]);
      setNewResumeName("");
      setNewResumeUrl("");
      setShowResumeDialog(false);
      toast.success("Resume added!");
    }
  };

  const handleDeleteResume = (id: string) => {
    setResumes(resumes.filter((r) => r.id !== id));
    toast.success("Resume deleted");
  };

  const handleSetPrimaryResume = (id: string) => {
    setResumes(resumes.map((r) => ({ ...r, is_primary: r.id === id })));
    toast.success("Primary resume updated");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="student" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={formData.avatar_url} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                  {profile?.user?.full_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className=" bg-gradient-primary bg-clip-text text-transparent">
                  <h1 className="text-3xl font-bold">
                  {profile?.user?.full_name || "Profile"}
                  </h1>
                  <span className="text-lg bg-gradient-primary bg-clip-text text-transparent">
                    {profile?.user?.email}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {formData.degree} {formData.university && `at ${formData.university}`}
                </p>
              </div>
            </div>
            <Button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={saving}
              className="bg-gradient-primary"
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

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">
                <User className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="education">
                <GraduationCap className="w-4 h-4 mr-2" />
                Education
              </TabsTrigger>
              <TabsTrigger value="experience">
                <Briefcase className="w-4 h-4 mr-2" />
                Experience
              </TabsTrigger>
              <TabsTrigger value="projects">
                <FileText className="w-4 h-4 mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="resumes">
                <Upload className="w-4 h-4 mr-2" />
                Resumes
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <Textarea
                        placeholder="Tell companies about yourself..."
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        rows={5}
                        className="w-full overflow-hidden resize-none"
                      />
                    ) : (
                      <p className="text-muted-foreground text-wrap overflow-scroll whitespace-pre-line">
                        {formData.bio || "No bio added yet"}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
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
                          <Linkedin className="w-4 h-4 inline mr-2" />
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
                          <Github className="w-4 h-4 inline mr-2" />
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

                <Card className="shadow-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Skills</CardTitle>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add skill..."
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddSkill();
                              }
                            }}
                            className="w-40"
                          />
                          <Button size="sm" onClick={handleAddSkill}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {skills.length === 0 ? (
                      <p className="text-muted-foreground">No skills added yet</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-base py-2 px-4"
                          >
                            {skill}
                            {isEditing && (
                              <X
                                className="w-3 h-3 ml-2 cursor-pointer"
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
                  <div className="flex items-center justify-between">
                    <CardTitle>Resumes</CardTitle>
                    {isEditing && (
                      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Resume
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Resume</DialogTitle>
                            <DialogDescription>
                              Upload your resume to Google Drive or Dropbox and paste the link
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Resume Name</Label>
                              <Input
                                placeholder="e.g., Software Engineer Resume"
                                value={newResumeName}
                                onChange={(e) => setNewResumeName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Resume URL</Label>
                              <Input
                                placeholder="https://drive.google.com/..."
                                value={newResumeUrl}
                                onChange={(e) => setNewResumeUrl(e.target.value)}
                              />
                            </div>
                            <Button onClick={handleAddResume} className="w-full">
                              Add Resume
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {resumes.length === 0 ? (
                    <div className="text-center py-12">
                      <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">
                        No resumes uploaded yet
                      </p>
                      {isEditing && (
                        <Button onClick={() => setShowResumeDialog(true)}>
                          Upload Your First Resume
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {resumes.map((resume) => (
                        <div
                          key={resume.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium">{resume.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                            {resume.is_primary && (
                              <Badge variant="default">Primary</Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(resume.url, "_blank")}
                            >
                              View
                            </Button>
                            {isEditing && (
                              <>
                                {!resume.is_primary && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSetPrimaryResume(resume.id)}
                                  >
                                    Set Primary
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteResume(resume.id)}
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
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;