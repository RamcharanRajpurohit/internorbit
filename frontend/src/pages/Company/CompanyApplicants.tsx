import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/common/Navigation";
import { toast } from "sonner";
import { applicationAPI } from "@/lib/api";
import { getSession } from "@/integrations/supabase/client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Clock, XCircle, Building } from "lucide-react";
import { Loader } from "@/components/ui/Loader";

const CompanyApplicants = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadApplications();
  }, []);

 const loadApplications = async () => {
  try {
    const session = await getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // CHANGED: Use backend API instead of supabase
    const response = await applicationAPI.getCompanyApplications({
      page: 1,
      limit: 100,
    });

    setApplications(response.applications || []);
  } catch (error: any) {
    toast.error("Failed to load applications");
  } finally {
    setLoading(false);
  }
};

const handleStatusChange = async (
  applicationId: string,
  newStatus: string
) => {
  try {
    // CHANGED: Use backend API instead of supabase
    await applicationAPI.updateStatus(applicationId, newStatus);
    
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );
    toast.success("Application status updated!");
  } catch (error: any) {
    toast.error("Failed to update status");
  }
};

  const filteredApplications =
    filterStatus === "all"
      ? applications
      : applications.filter((app) => app.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "shortlisted":
        return "bg-green-100 text-green-800";
      case "accepted":
        return "bg-emerald-100 text-emerald-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Loader/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="company" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Applications
            </h1>
            <p className="text-muted-foreground">
              {applications.length} total applications
            </p>
          </div>

          <Card className="p-4 shadow-card mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Filter by status:</span>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {filteredApplications.length === 0 ? (
            <Card className="p-12 text-center shadow-card">
              <p className="text-xl text-muted-foreground">
                No applications found
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app, idx) => (
                <Card
                  key={app.id}
                  className="p-6 shadow-card hover:shadow-elevated transition-all animate-scale-in"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                          <span className="text-white font-bold">
                            {app.student?.full_name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">
                            {app.student?.full_name || "Unknown"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {app.student?.email}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Applied for: <strong>{app.internships?.title}</strong>
                      </p>
                      {app.cover_letter && (
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                          {app.cover_letter}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Applied on{" "}
                        {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <Badge
                        className={`${getStatusColor(app.status)} flex items-center gap-1`}
                      >
                        {getStatusIcon(app.status)}
                        {app.status.charAt(0).toUpperCase() +
                          app.status.slice(1)}
                      </Badge>
                      <Select
                        value={app.status}
                        onValueChange={(newStatus) =>
                          handleStatusChange(app.id, newStatus)
                        }
                      >
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="shortlisted">
                            Shortlisted
                          </SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
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

export default CompanyApplicants;