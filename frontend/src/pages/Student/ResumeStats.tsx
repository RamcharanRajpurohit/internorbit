import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/common/Navigation';
import { toast } from 'sonner';
import {
  Eye,
  Download,
  FileText,
  Building2,
  Calendar,
  BarChart3,
  Eye as EyeIcon,
  Lock,
  Globe,
} from 'lucide-react';
import { Loader } from '@/components/ui/Loader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ResumeUploader } from '@/components/student/ResumeUploader';

const API_URL = import.meta.env.VITE_API_URI;

interface Resume {
  _id: string;
  file_name: string;
  visibility: 'private' | 'public' | 'restricted';
  views: number;
  downloads: number;
  uploaded_at: string;
  last_viewed?: string;
  is_primary?: boolean;
  scan_status?: string;
}

interface Company {
  company_id: string;
  company_name: string;
  views: number;
  downloads: number;
  last_accessed: string;
}

const ResumeStats = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [editingResume, setEditingResume] = useState<string | null>(null);
  const [newVisibility, setNewVisibility] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false); // ADD THIS

  useEffect(() => {
    loadStats();
  }, []);

  // FIXED: Get auth token properly
  const getAuthToken = async () => {
    return localStorage.getItem('token') || '';
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      
      const response = await fetch(`${API_URL}/resume/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResumes(data.resumes || []);
        setCompanies(data.companies || []);
        setTotalViews(data.total_views || 0);
        setTotalDownloads(data.total_downloads || 0);
      }
    } catch (error: any) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load resume statistics');
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Handle upload success (instead of old upload method)
  const handleResumeUploadSuccess = (newResume: any) => {
    setResumes([...resumes, newResume]);
    setShowUploadDialog(false);
    toast.success('Resume uploaded successfully!');
    // Reload stats to show new resume
    loadStats();
  };

  const handleVisibilityChange = async (resumeId: string, visibility: string) => {
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${API_URL}/resume/${resumeId}/visibility`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ visibility }),
        }
      );

      if (response.ok) {
        toast.success('Resume visibility updated');
        setEditingResume(null);
        loadStats();
      }
    } catch (error: any) {
      toast.error('Failed to update visibility');
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="w-4 h-4 text-green-500" />;
      case 'private':
        return <Lock className="w-4 h-4 text-red-500" />;
      case 'restricted':
        return <EyeIcon className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Resume Analytics
              </h1>
            </div>
            <p className="text-muted-foreground">
              Track views, downloads, and company interactions
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Views</p>
                    <p className="text-3xl font-bold">{totalViews}</p>
                  </div>
                  <Eye className="w-8 h-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Downloads</p>
                    <p className="text-3xl font-bold">{totalDownloads}</p>
                  </div>
                  <Download className="w-8 h-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Companies Viewing</p>
                    <p className="text-3xl font-bold">{companies.length}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumes List */}
          <Card className="shadow-card mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Resumes</CardTitle>
                <Button
                  onClick={() => setShowUploadDialog(true)}
                  className="bg-gradient-primary"
                >
                  Upload Resume
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {resumes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No resumes uploaded yet</p>
                  <Button
                    onClick={() => setShowUploadDialog(true)}
                    className="mt-4 bg-gradient-primary"
                  >
                    Upload Your First Resume
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {resumes.map((resume) => (
                    <div
                      key={resume._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold">{resume.file_name}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(resume.uploaded_at).toLocaleDateString()}
                              {resume.is_primary && (
                                <>
                                  {' • '}
                                  <Badge variant="secondary">Primary</Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 mr-4">
                        <div className="text-center">
                          <Eye className="w-4 h-4 mx-auto mb-1 text-primary" />
                          <p className="text-lg font-bold">{resume.views}</p>
                          <p className="text-xs text-muted-foreground">Views</p>
                        </div>
                        <div className="text-center">
                          <Download className="w-4 h-4 mx-auto mb-1 text-primary" />
                          <p className="text-lg font-bold">{resume.downloads}</p>
                          <p className="text-xs text-muted-foreground">Downloads</p>
                        </div>
                      </div>

                      <Dialog
                        open={editingResume === resume._id}
                        onOpenChange={(open) =>
                          setEditingResume(open ? resume._id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setNewVisibility(resume.visibility)}
                            className="gap-2"
                          >
                            {getVisibilityIcon(resume.visibility)}
                            {resume.visibility.charAt(0).toUpperCase() +
                              resume.visibility.slice(1)}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Resume Visibility</DialogTitle>
                            <DialogDescription>
                              Control who can see and download this resume
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <RadioGroup value={newVisibility} onValueChange={setNewVisibility}>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                                  <RadioGroupItem value="private" id="private" />
                                  <Label htmlFor="private" className="flex-1 cursor-pointer">
                                    <div className="font-semibold flex items-center gap-2">
                                      <Lock className="w-4 h-4" />
                                      Private
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Only you can see this resume
                                    </p>
                                  </Label>
                                </div>

                                <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                                  <RadioGroupItem value="public" id="public" />
                                  <Label htmlFor="public" className="flex-1 cursor-pointer">
                                    <div className="font-semibold flex items-center gap-2">
                                      <Globe className="w-4 h-4" />
                                      Public
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Any verified company can discover and access
                                    </p>
                                  </Label>
                                </div>

                                <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                                  <RadioGroupItem value="restricted" id="restricted" />
                                  <Label htmlFor="restricted" className="flex-1 cursor-pointer">
                                    <div className="font-semibold flex items-center gap-2">
                                      <EyeIcon className="w-4 h-4" />
                                      Application Only
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Only accessible when you apply for a job
                                    </p>
                                  </Label>
                                </div>
                              </div>
                            </RadioGroup>

                            <Button
                              onClick={() =>
                                handleVisibilityChange(resume._id, newVisibility)
                              }
                              className="w-full bg-gradient-primary"
                            >
                              Update Visibility
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Companies Viewing */}
          {companies.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Companies Viewing Your Resumes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companies.map((company) => (
                    <div
                      key={company.company_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold">{company.company_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last accessed:{' '}
                          {new Date(company.last_accessed).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <Eye className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-lg font-bold">{company.views}</p>
                          <p className="text-xs text-muted-foreground">Views</p>
                        </div>
                        <div className="text-center">
                          <Download className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-lg font-bold">{company.downloads}</p>
                          <p className="text-xs text-muted-foreground">Downloads</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Dialog - FIXED */}
          <ResumeUploader
            open={showUploadDialog}
            onOpenChange={setShowUploadDialog}
            onSuccess={handleResumeUploadSuccess}
          />
        </div>
      </main>
    </div>
  );
};

export default ResumeStats;