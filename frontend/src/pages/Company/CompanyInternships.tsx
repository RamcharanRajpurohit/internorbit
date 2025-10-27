import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";
import { internshipAPI } from "@/lib/api";
import { getSession } from "@/integrations/supabase/client";

import {
  MapPin,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Plus,
  Users,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CompanyInternships = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState<any[]>([]);

  useEffect(() => {
    loadInternships();
  }, []);

 const loadInternships = async () => {
  try {
    const session = await getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // CHANGED: Use backend API instead of supabase
    const response = await internshipAPI.getAll({
      page: 1,
      limit: 100,
    });

    setInternships(response.internships || []);
  } catch (error: any) {
    toast.error("Failed to load internships");
  } finally {
    setLoading(false);
  }
};

const handleDelete = async (id: string) => {
  try {
    // CHANGED: Use backend API instead of supabase
    await internshipAPI.delete(id);
    setInternships((prev) => prev.filter((i) => i._id !== id));
    toast.success("Internship deleted successfully");
  } catch (error: any) {
    toast.error("Failed to delete internship");
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-pulse text-2xl text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="company" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8 animate-slide-up">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                Internships
              </h1>
              <p className="text-muted-foreground">
                {internships.length} internships posted
              </p>
            </div>
            <Button
              onClick={() => navigate("/company/internships/new")}
              className="bg-gradient-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Internship
            </Button>
          </div>

          {internships.length === 0 ? (
            <Card className="p-12 text-center shadow-card">
              <p className="text-xl text-muted-foreground mb-4">
                No internships posted yet
              </p>
              <Button
                onClick={() => navigate("/company/internships/new")}
                className="bg-gradient-primary"
              >
                Create Your First Internship
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {internships.map((internship, idx) => (
                <Card
                  key={internship.id}
                  className="p-6 shadow-card hover:shadow-elevated transition-all animate-scale-in"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold">
                          {internship.title}
                        </h3>
                        <Badge
                          variant={
                            internship.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {internship.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {internship.description?.substring(0, 150)}...
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {internship.location && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {internship.location}
                          </Badge>
                        )}
                        {internship.stipend_min && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${internship.stipend_min}-${internship.stipend_max}/mo
                          </Badge>
                        )}
                        {internship.duration_months && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {internship.duration_months} months
                          </Badge>
                        )}
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {internship.applications_count || 0} applications
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(`/company/internships/${internship.id}/edit`)
                        }
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Internship</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this internship?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex gap-2 justify-end">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(internship.id)}
                              className="bg-destructive"
                            >
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyInternships;