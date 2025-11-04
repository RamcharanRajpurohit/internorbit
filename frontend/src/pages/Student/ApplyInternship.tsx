import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { internshipAPI, applicationAPI, resumeAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Navigation from '@/components/common/Navigation';
import { ResumeUploader } from '@/components/student/ResumeUploader';
import { 
  Send, ArrowLeft, Upload, FileText, Plus, Eye, X, Download, AlertCircle 
} from 'lucide-react';
import { Loader } from '@/components/ui/Loader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getAuthToken } from '@/integrations/supabase/client';

const ApplyInternship = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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

  const [formData, setFormData] = useState({
    cover_letter: '',
  });

  useEffect(() => {
    loadInternship();
    loadResumes();
  }, [id]);

  const loadInternship = async () => {
    try {
      const response = await internshipAPI.getById(id!);
      setInternship(response.internship);
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
      await applicationAPI.create({
        internship_id: id!,
        resume_id: selectedResumeId,
        cover_letter: formData.cover_letter,
      });

      toast.success('Application submitted! Good luck! 🚀');
      navigate('/applications');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
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
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Card className="p-8 shadow-elevated">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">
                  Apply for {internship.title}
                </h1>
                <p className="text-muted-foreground">
                  at {company?.company_name || 'Company'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Resume Selection - IMPROVED */}
                <div className="space-y-3 p-4 bg-muted rounded-lg border-2 border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label className="text-base font-semibold">
                        Select or Upload Resume *
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Choose a resume to include with your application
                      </p>
                    </div>
                    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          New Resume
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
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
                          <Button className="bg-gradient-primary">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Resume
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
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
                      <div className="space-y-2">
                        {resumes.map((resume) => (
                          <div
                            key={resume._id}
                            className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary transition-colors"
                          >
                            <RadioGroupItem value={resume._id} id={resume._id} />
                            <label htmlFor={resume._id} className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">{resume.file_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {resume.scan_status === 'clean'
                                      ? '✓ Verified'
                                      : resume.scan_status === 'pending'
                                      ? '⏳ Scanning...'
                                      : '⚠ Not approved'}
                                    {' • '}
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
                  <Label htmlFor="cover_letter" className="text-base">
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
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.cover_letter.length} / 5000 characters
                  </p>
                </div>

                {/* Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Tips for a great application:</p>
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
                  className="w-full bg-gradient-primary text-lg h-11"
                  size="lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </Card>
          </div>
        </main>
      </div>

      {/* Resume Preview Modal - ENHANCED */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-7xl w-[95vw] h-[95vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b sticky top-0 bg-background z-10">
            <div className="flex-1">
              <DialogTitle>Resume Preview</DialogTitle>
              {previewResume && (
                <p className="text-xs text-muted-foreground mt-1">{previewResume.file_name}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewOpen(false)}
              className="h-8 w-8 p-0 ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>

          {previewLoading ? (
            <div className="flex items-center justify-center h-96 bg-gray-50">
              <Loader />
            </div>
          ) : previewUrl ? (
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {previewResume?.file_name?.endsWith('.pdf') ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full min-h-[500px]"
                  title={previewResume?.file_name}
                />
              ) : (
                <div className="p-8 bg-white h-full flex flex-col items-center justify-center min-h-[500px]">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 max-w-md">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Word documents (.docx, .doc) cannot be previewed in the browser. Please download the file to view the full content and formatting.
                    </p>
                  </div>
                  <Button
                    onClick={() => window.open(previewUrl, '_blank')}
                    className="gap-2 bg-gradient-primary"
                    size="lg"
                  >
                    <Download className="w-4 h-4" />
                    Download Resume
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
              <p className="text-muted-foreground">Unable to load preview</p>
            </div>
          )}

          {/* Footer with Actions */}
          <div className="border-t px-6 py-4 bg-background sticky bottom-0 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewOpen(false)}
            >
              Close
            </Button>
            {previewUrl && (
              <Button
                onClick={() => window.open(previewUrl, '_blank')}
                className="gap-2"
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