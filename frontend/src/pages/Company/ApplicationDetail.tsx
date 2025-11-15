import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Navigation from '@/components/common/Navigation';
import {
  Download,
  Eye,
  ArrowLeft,
  FileText,
  Mail,
  Phone,
  Linkedin as LinkedInIcon,
  Github as GitHubIcon,
  MapPin,
  GraduationCap,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { resumeAPI } from '@/lib/api';
import { useApplicationDetail } from '@/hooks/useApplications';
import { ApplicationStatus } from '@/types';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResume, setPreviewResume] = useState<any>(null);

  // Use Redux hook for application state management
  const {
    application,
    isLoading,
    updateStatus,
  } = useApplicationDetail(id);

  const handleViewResume = async (resume: any) => {
    if (!application) return;

    try {
      setPreviewResume(resume);
      setPreviewLoading(true);
      setPreviewOpen(true);

      const resumeId = resume._id || resume.id;
      const applicationId = application._id || application.id;

      const data = await resumeAPI.getApplicationResume(
        resumeId,
        applicationId,
        'view'
      );

      setPreviewUrl(data.url);
    } catch (error: any) {
      toast.error('Failed to load resume');
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!application) return;

    try {
      const resumeId = typeof application.resume_id === 'object'
        ? application.resume_id._id
        : application.resume_id;

      const data = await resumeAPI.getApplicationResume(
        resumeId,
        application._id || application.id,
        'download'
      );

      const link = document.createElement('a');
      link.href = data.url;
      link.download = typeof application.resume_id === 'object'
        ? application.resume_id.file_name || 'resume.pdf'
        : 'resume.pdf';
      link.click();

      toast.success('Resume downloaded');
    } catch (error: any) {
      toast.error('Failed to download resume');
    }
  };

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    try {
      await updateStatus(newStatus);
      toast.success('Status updated');
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // Skeleton loader component
  const ApplicationSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="company" />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" className="mb-6" disabled>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Info Card - Skeleton */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-5 w-64" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Actions Card - Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>

          {/* Additional sections skeleton */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );

  if (isLoading) {
    return <ApplicationSkeleton />;
  }

  if (!application) return null;

  const student = application.student;

  // Type helper functions
  const isStudentObject = (student: any): student is { _id: string; user_id: string; full_name: string; email: string; avatar_url?: string; university?: string; degree?: string; graduation_year?: number; location?: string; phone?: string; linkedin_url?: string; github_url?: string; bio?: string; skills?: string[]; } => {
    return typeof student === 'object' && student !== null && 'full_name' in student;
  };

  const isResumeObject = (resume: any): resume is { _id: string; file_name: string; file_size?: number; scan_status: 'clean' | 'pending' | 'flagged'; views_count?: number; downloads_count?: number; } => {
    return typeof resume === 'object' && resume !== null && '_id' in resume;
  };

  const isInternshipObject = (internship: any): internship is { title: string } => {
    return typeof internship === 'object' && internship !== null && 'title' in internship;
  };

  const studentObj = isStudentObject(student) ? student : null;
  const resume = isResumeObject(application.resume_id) ? application.resume_id : null;
  const internship = isInternshipObject(application.internship_id) ? application.internship_id : null;

  const studentName = studentObj?.full_name || 'Unknown Student';
  const studentEmail = studentObj?.email || 'N/A';

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        <Navigation role="company" />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 hover:bg-muted/50 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Card className="p-8 shadow-elevated">
              <CardHeader className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {studentObj?.avatar_url ? (
                      <img
                        src={studentObj.avatar_url}
                        alt={studentName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-xl">
                          {getInitials(studentName)}
                        </span>
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-2xl mb-1">
                        {studentName}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {studentEmail}
                      </div>
                    </div>
                  </div>
                  <Badge className="text-sm px-3 py-1">
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Position Applied For */}
                <div>
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Position Applied For
                  </h3>
                  <p className="text-muted-foreground ml-7">{internship?.title || 'N/A'}</p>
                </div>

                {/* Student Profile Info */}
                <div>
                  <h3 className="font-bold text-lg mb-3">Student Profile</h3>
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    {studentObj?.university && (
                      <div className="flex items-start gap-2">
                        <GraduationCap className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">University</p>
                          <p className="text-sm text-muted-foreground">{studentObj.university}</p>
                        </div>
                      </div>
                    )}

                    {studentObj?.degree && (
                      <div className="flex items-start gap-2">
                        <GraduationCap className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Degree</p>
                          <p className="text-sm text-muted-foreground">{studentObj.degree}</p>
                        </div>
                      </div>
                    )}

                    {studentObj?.graduation_year && (
                      <div className="flex items-start gap-2">
                        <GraduationCap className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Graduation Year</p>
                          <p className="text-sm text-muted-foreground">{studentObj.graduation_year}</p>
                        </div>
                      </div>
                    )}

                    {studentObj?.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{studentObj.location}</p>
                        </div>
                      </div>
                    )}

                    {studentObj?.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">{studentObj.phone}</p>
                        </div>
                      </div>
                    )}

                    {studentObj?.linkedin_url && (
                      <div className="flex items-start gap-2">
                        <LinkedInIcon className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">LinkedIn</p>
                          <a
                            href={studentObj.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Profile
                          </a>
                        </div>
                      </div>
                    )}

                    {studentObj?.github_url && (
                      <div className="flex items-start gap-2">
                        <GitHubIcon className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">GitHub</p>
                          <a
                            href={studentObj.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Profile
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {studentObj?.bio && (
                  <div>
                    <h3 className="font-bold text-lg mb-2">Bio</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {studentObj.bio}
                      </p>
                    </div>
                  </div>
                )}

                {/* Skills */}
                {Array.isArray(studentObj?.skills) && studentObj.skills.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {studentObj.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover Letter */}
                <div>
                  <h3 className="font-bold text-lg mb-2">Cover Letter</h3>
                  <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                    {application.cover_letter}
                  </div>
                </div>

                {/* Resume Section */}
                {resume && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-3">Resume</h3>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-semibold">{resume.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {resume.file_size ? `${(resume.file_size / 1024 / 1024).toFixed(2)} MB • ` : ''}
                            {resume.scan_status === 'clean'
                              ? '✓ Verified'
                              : resume.scan_status === 'pending'
                              ? '⏳ Scanning'
                              : '⚠ Review Required'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewResume(resume)}
                          disabled={resume.scan_status !== 'clean'}
                          title={
                            resume.scan_status !== 'clean' ? 'Resume must pass security scan first' : 'Preview resume'
                          }
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" onClick={handleDownloadResume}>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Views: {resume.views_count ?? 0} • Downloads: {resume.downloads_count ?? 0}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h3 className="font-bold text-lg mb-2">Timeline</h3>
                  <div className="space-y-2 text-sm bg-muted p-4 rounded-lg">
                    <p>
                      <span className="font-medium">Applied:</span>{' '}
                      {new Date(application.applied_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {application.reviewed_at && (
                      <p>
                        <span className="font-medium">Reviewed:</span>{' '}
                        {new Date(application.reviewed_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                    {application.updated_at && (
                      <p>
                        <span className="font-medium">Last Updated:</span>{' '}
                        {new Date(application.updated_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Management - Bottom */}
                <div className="border-t pt-6">
                  <h3 className="font-bold text-lg mb-4">Update Status</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: 'pending' as const, label: 'Pending', color: 'bg-yellow-100 hover:bg-yellow-200' },
                      { value: 'reviewed' as const, label: 'Reviewed', color: 'bg-blue-100 hover:bg-blue-200' },
                      { value: 'shortlisted' as const, label: 'Shortlisted', color: 'bg-green-100 hover:bg-green-200' },
                      { value: 'accepted' as const, label: 'Accepted', color: 'bg-emerald-100 hover:bg-emerald-200' },
                      { value: 'rejected' as const, label: 'Rejected', color: 'bg-red-100 hover:bg-red-200' },
                    ]).map((status) => (
                      <Button
                        key={status.value}
                        onClick={() => handleStatusChange(status.value)}
                        variant={
                          application.status === status.value ? 'default' : 'outline'
                        }
                        className={`${
                          application.status !== status.value ? status.color : ''
                        }`}
                      >
                        {status.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Resume Preview Modal */}
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
                  className="w-full h-full min-h-[500px]"
                  title={previewResume?.file_name}
                />
              ) : (
                <div className="p-8 bg-card h-full flex flex-col items-center justify-center min-h-[500px]">
                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 mb-6 max-w-md">
                    <p className="text-sm text-accent-foreground">
                      <strong>Note:</strong> Word documents (.docx, .doc) cannot be previewed in the browser. Please download the file to view the full content and formatting.
                    </p>
                  </div>
                  <Button
                    onClick={() => window.open(previewUrl, '_blank')}
                    className="gap-2"
                    size="lg"
                  >
                    <Download className="w-4 h-4" />
                    Download Resume
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted p-8">
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
                onClick={() => {
                  handleDownloadResume();
                }}
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

export default ApplicationDetail;