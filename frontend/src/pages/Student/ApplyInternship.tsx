// frontend/src/pages/ApplyInternship.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { internshipAPI, applicationAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { Send, ArrowLeft, Upload } from "lucide-react";
import { Loader } from "@/components/ui/Loader";

const ApplyInternship = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [internship, setInternship] = useState<any>(null);
  const [formData, setFormData] = useState({
    cover_letter: "",
    resume_url: "",
  });

  useEffect(() => {
    loadInternship();
  }, [id]);

  const loadInternship = async () => {
    try {
      setLoading(true);
      const response = await internshipAPI.getById(id!);
      setInternship(response.internship);
    } catch (error: any) {
      toast.error("Failed to load internship");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cover_letter || !formData.resume_url) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await applicationAPI.create({
        internship_id: id!,
        cover_letter: formData.cover_letter,
        resume_url: formData.resume_url,
      });

      toast.success("Application submitted successfully!");
      navigate("/applications");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Loader/>
      </div>
    );
  }

  if (!internship) {
    return null;
  }

  const company = internship.company_id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="student" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="p-8 shadow-elevated">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Apply for {internship.title}</h1>
              <p className="text-muted-foreground">
                at {company?.company_name || "Company"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resume">Resume URL *</Label>
                <div className="flex gap-2">
                  <Input
                    id="resume"
                    type="url"
                    placeholder="https://drive.google.com/your-resume"
                    value={formData.resume_url}
                    onChange={(e) =>
                      setFormData({ ...formData, resume_url: e.target.value })
                    }
                    required
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload your resume to Google Drive or Dropbox and paste the link
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_letter">Cover Letter *</Label>
                <Textarea
                  id="cover_letter"
                  placeholder="Tell us why you're interested in this position..."
                  value={formData.cover_letter}
                  onChange={(e) =>
                    setFormData({ ...formData, cover_letter: e.target.value })
                  }
                  rows={10}
                  required
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.cover_letter.length} / 5000 characters
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Application Tips:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Highlight relevant skills and experience</li>
                  <li>• Explain why you're interested in this role</li>
                  <li>• Mention specific projects or achievements</li>
                  <li>• Keep it concise but compelling</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-primary"
                size="lg"
              >
                <Send className="w-5 h-5 mr-2" />
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ApplyInternship;