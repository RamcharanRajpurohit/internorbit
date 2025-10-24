import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { applicationAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { Briefcase, Calendar, MapPin, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Applications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    checkAuth();
    loadApplications();
  }, [status, page]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationAPI.getStudentApplications({
        page,
        limit: 10,
        status: status !== "all" ? status : undefined,
      });
      setApplications(response.applications || []);
      setTotal(response.pagination?.total || 0);
    } catch (error: any) {
      console.error("Error loading applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    try {
      await applicationAPI.withdraw(applicationId);
      setApplications(applications.filter(a => a.id !== applicationId));
      toast.success("Application withdrawn");
    } catch (error: any) {
      toast.error("Failed to withdraw application");
    }
  };

  const getStatusColor = (appStatus: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      reviewed: "bg-blue-500",
      shortlisted: "bg-purple-500",
      accepted: "bg-green-500",
      rejected: "bg-red-500",
    };
    return colors[appStatus] || "bg-gray-500";
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-pulse text-2xl text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="student" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              My Applications
            </h1>
            <p className="text-muted-foreground">
              {total} total applications
            </p>
          </div>

          <Tabs value={status} onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>

          {applications.length === 0 ? (
            <Card className="text-center p-12">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold mb-2">No applications yet</h3>
              <p className="text-muted-foreground mb-6">
                Start swiping through internships and apply to positions you're interested in
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-gradient-primary"
              >
                Discover Internships
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const internship = app.internship;
                const company = internship.company;
                const companyProfile = company?.company_profiles?.[0];

                return (
                  <Card key={app.id} className="hover:shadow-elevated transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {companyProfile?.logo_url ? (
                              <img
                                src={companyProfile.logo_url}
                                alt={companyProfile.company_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-secondary flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {companyProfile?.company_name?.[0]}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-muted-foreground">
                                {companyProfile?.company_name}
                              </p>
                            </div>
                          </div>
                          <CardTitle className="text-2xl">{internship.title}</CardTitle>
                          <CardDescription className="mt-1">
                            Applied {new Date(app.applied_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={`${getStatusColor(app.status)} text-white`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="flex flex-wrap gap-4 mb-4">
                        {internship.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {internship.location}
                          </div>
                        )}
                        {internship.duration_months && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {internship.duration_months} months
                          </div>
                        )}
                      </div>

                      {app.cover_letter && (
                        <div className="mb-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-semibold mb-1">Cover Letter:</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {app.cover_letter}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => navigate(`/internship/${internship.id}`)}
                          variant="outline"
                          className="flex-1"
                        >
                          View Position
                        </Button>
                        {app.status === "pending" && (
                          <Button
                            onClick={() => handleWithdraw(app.id)}
                            variant="outline"
                            className="flex-1"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {Math.ceil(total / 10)}
                </span>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Applications;