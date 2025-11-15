import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { internshipAPI, applicationAPI, resumeAPI } from '@/lib/api';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Navigation from '@/components/common/Navigation';
import { ResumeUploader } from '@/components/student/ResumeUploader';
import { ProfileCompletionAlert } from '@/components/common/ProfileCompletionAlert';
import { 
  Send, ArrowLeft, Upload, FileText, Plus, Eye, X, Download, AlertCircle 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getAuthToken } from '@/integrations/supabase/client';
import { useStudentApplications } from '@/hooks/useApplications';

const ApplyInternship = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { createApplication } = useStudentApplications(false);
  const isMobile = useIsMobile();
  
  // Get internships from Redux
  const reduxInternships = useSelector((state: RootState) => state.internship.internships);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [internship, setInternship] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewResume, setPreviewResume] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [missingFields, setMissingFields] = useState<any>(null);

  const [formData, setFormData] = useState({
    cover_letter: '',
  });
  
  const isProfileComplete = user?.profile_completed || user?.profile_complete;

  useEffect(() => {
    loadInternship();
    loadResumes();
    
    // Check if profile is complete
    if (!isProfileComplete) {
      setShowProfileAlert(true);
    }
  }, [id, isProfileComplete]);

  const loadInternship = async () => {
    try {
      // First check Redux cache
      const cachedInternship = reduxInternships.find(
        (int: any) => (int._id || int.id) === id
      );
      
      if (cachedInternship) {
        // Use cached data immediately
        setInternship(cachedInternship);
        setLoading(false);
        
        // Fetch fresh data in background to check has_applied status
        internshipAPI.getById(id!).then(response => {
          const internshipData = response.internship;
          if (internshipData.has_applied) {
            toast.info('You have already applied to this internship');
            setTimeout(() => navigate(`/internship/${id}`), 1500);
            return;
          }
          setInternship(internshipData);
        }).catch(() => {}); // Silent fail for background update
        return;
      }
      
      // If not in cache, fetch from API
      const response = await internshipAPI.getById(id!);
      const internshipData = response.internship;
      
      // Check if already applied
      if (internshipData.has_applied) {
        toast.info('You have already applied to this internship');
        setTimeout(() => {
          navigate(`/internship/${id}`);
        }, 1500);
        return;
      }
      
      setInternship(internshipData);
    } catch (error: any) {
      toast.error('Failed to load internship');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadResumes = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URI}/resume/my-resumes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const cleanResumes = data.resumes || [];
        setResumes(cleanResumes);
        
        // Auto-select primary or first resume
        const primary = cleanResumes.find((r: any) => r.is_primary);
        if (primary) {
          setSelectedResumeId(primary._id);
        } else if (cleanResumes.length > 0) {
          setSelectedResumeId(cleanResumes[0]._id);
        }
      }
    } catch (error: any) {
      console.error('Error loading resumes:', error);
      toast.error('Failed to load resumes');
    }
  };

  const handleResumeUploadSuccess = (newResume: any) => {
    setResumes([...resumes, newResume]);
    setSelectedResumeId(newResume._id);
    setShowUploadDialog(false);
    toast.success('Resume uploaded successfully!');
  };

  const handlePreviewResume = async (resume: any) => {
    setPreviewResume(resume);
    setPreviewLoading(true);
    setPreviewOpen(true);

    try {
      const token = await getAuthToken();
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
      toast.error('Failed to load resume preview');
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if profile is complete before submission
    if (!isProfileComplete) {
      toast.error('Please complete your profile before applying');
      setShowProfileAlert(true);
      return;
    }

    if (!selectedResumeId) {
      toast.error('Please select or upload a resume');
      return;
    }

    if (!formData.cover_letter.trim()) {
      toast.error('Please write a cover letter');
      return;
    }

    setSubmitting(true);
    try {
      await createApplication({
        internship_id: id!,
        resume_id: selectedResumeId,
        cover_letter: formData.cover_letter,
      }, internship);

      toast.success('Application submitted! Good luck! 🚀');
      navigate('/applications');
    } catch (error: any) {
      // Check if error is about incomplete profile and extract missing fields
      if (error.message?.includes('complete your profile') || error.profile_incomplete) {
        setShowProfileAlert(true);
        
        // Try to parse missing fields from error response
        try {
          const errorResponse = JSON.parse(error.message.split('\n')[0]);
          if (errorResponse.missing_fields) {
            setMissingFields(errorResponse.missing_fields);
          }
        } catch {
          // If parsing fails, just show the alert without specific fields
        }
      }
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        <Navigation role="student" />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {!isMobile && (
              <Button variant="ghost" className="mb-4" disabled>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            
            <Card className="p-6">
              <div className="space-y-6">
                {/* Header skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>

                {/* Form skeleton */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                  
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>

                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!internship) return null;

  const company = internship.company_id;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        <Navigation role="student" />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {!isMobile && (
              <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}

            <Card className="p-4 sm:p-8 shadow-elevated">
              {/* Profile Completion Alert */}
              {showProfileAlert && !isProfileComplete && (
                <div className="mb-6">
                  <ProfileCompletionAlert 
                    userRole="student"
                    onDismiss={() => setShowProfileAlert(false)}
                    missingFields={missingFields}
                  />
                </div>
              )}
              
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">
                  Apply for {internship.title}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground break-words">
                  at {company?.company_name || 'Company'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Resume Selection - IMPROVED */}
                <div className="space-y-3 p-3 sm:p-4 bg-muted rounded-lg border-2 border-border overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <Label className="text-sm sm:text-base font-semibold">
                        Select or Upload Resume *
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Choose a resume to include with your application
                      </p>
                    </div>
                    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="w-full sm:w-auto flex-shrink-0">
                          <Plus className="w-4 h-4 mr-2" />
                          <span className="sm:inline">New Resume</span>
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
                  </div>

                  {resumes.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-3">
                        No resumes yet. Upload your first one.
                      </p>
                      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-primary w-full sm:w-auto">
                            <Upload className="w-4 h-4 mr-2" />
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
                    </div>
                  ) : (
                    <RadioGroup value={selectedResumeId} onValueChange={setSelectedResumeId}>
                      <div className="space-y-2 overflow-hidden">
                        {resumes.map((resume) => (
                          <div
                            key={resume._id}
                            className="flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg hover:border-primary transition-colors bg-background"
                          >
                            <RadioGroupItem value={resume._id} id={resume._id} className="flex-shrink-0 mt-1 sm:mt-0" />
                            <label htmlFor={resume._id} className="flex-1 cursor-pointer min-w-0">
                              <div className="flex items-start sm:items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 sm:mt-0" />
                                <div className="min-w-0 flex-1">
                                  <p 
                                    className="text-xs sm:text-sm font-medium truncate" 
                                    title={resume.file_name}
                                  >
                                    {resume.file_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {/* {resume.scan_status === 'clean'
                                      ? '✓ Verified'
                                      : resume.scan_status === 'pending'
                                      ? '⏳ Scanning...'
                                      : '⚠ Not approved'}
                                    {' • '} */}
                                    {new Date(resume.uploaded_at).toLocaleDateString()}
                                    {resume.is_primary && ' • Primary'}
                                  </p>
                                </div>
                              </div>
                            </label>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handlePreviewResume(resume)}
                              disabled={resume.scan_status !== 'clean'}
                              className="flex-shrink-0 h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                </div>

                {/* Cover Letter */}
                <div className="space-y-2">
                  <Label htmlFor="cover_letter" className="text-sm sm:text-base">
                    Cover Letter *
                  </Label>
                  <Textarea
                    id="cover_letter"
                    placeholder="Why are you interested in this position? Highlight relevant skills and experiences..."
                    value={formData.cover_letter}
                    onChange={(e) =>
                      setFormData({ ...formData, cover_letter: e.target.value })
                    }
                    rows={6}
                    required
                    className="resize-none text-sm sm:text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.cover_letter.length} / 5000 characters
                  </p>
                </div>

                {/* Tips */}
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 sm:p-4 flex gap-2 sm:gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-foreground min-w-0">
                    <p className="font-medium mb-1 text-xs sm:text-sm">Tips for a great application:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Personalize each cover letter</li>
                      <li>• Highlight relevant projects and skills</li>
                      <li>• Show enthusiasm for the company</li>
                    </ul>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting || !selectedResumeId}
                  className="w-full bg-gradient-primary text-base sm:text-lg h-10 sm:h-11"
                  size="lg"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </Card>
          </div>
        </main>
      </div>

      {/* Resume Preview Modal - ENHANCED */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-[95vw] max-w-7xl h-[90vh] sm:h-[95vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b sticky top-0 bg-background z-10">
            <div className="flex-1 min-w-0 pr-2">
              <DialogTitle className="text-base sm:text-lg">Resume Preview</DialogTitle>
              {previewResume && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{previewResume.file_name}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewOpen(false)}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>

          {previewLoading ? (
            <div className="flex items-center justify-center h-96 bg-muted">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-muted-foreground">Loading resume...</p>
              </div>
            </div>
          ) : previewUrl ? (
            <div className="flex-1 overflow-y-auto bg-muted">
              {previewResume?.file_name?.endsWith('.pdf') ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full min-h-[400px] sm:min-h-[500px]"
                  title={previewResume?.file_name}
                />
              ) : (
                <div className="p-4 sm:p-8 bg-card h-full flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px]">
                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 max-w-md w-full">
                    <p className="text-xs sm:text-sm text-accent-foreground">
                      <strong>Note:</strong> Word documents (.docx, .doc) cannot be previewed in the browser. Please download the file to view the full content and formatting.
                    </p>
                  </div>
                  <Button
                    onClick={() => window.open(previewUrl, '_blank')}
                    className="gap-2 bg-gradient-primary w-full sm:w-auto"
                    size="lg"
                  >
                    <Download className="w-4 h-4" />
                    Download Resume
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted p-4 sm:p-8">
              <p className="text-sm sm:text-base text-muted-foreground">Unable to load preview</p>
            </div>
          )}

          {/* Footer with Actions */}
          <div className="border-t px-4 sm:px-6 py-3 sm:py-4 bg-background sticky bottom-0 flex flex-col sm:flex-row justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewOpen(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            {previewUrl && (
              <Button
                onClick={() => window.open(previewUrl, '_blank')}
                className="gap-2 w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApplyInternship;