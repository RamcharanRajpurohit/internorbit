import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/common/Navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, XCircle, Briefcase, User, Calendar, MapPin, Mail, Eye } from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/hooks/useAuth";
import { useRouteRefresh } from "@/hooks/useRouteRefresh";
import { useCompanyApplications } from "@/hooks/useApplications";
import { Button } from "@/components/ui/button";
const CompanyApplicants = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("all");

  // Use our new state management hooks
  const { isAuthenticated, isCompany } = useAuth();
  
  // Detect browser refresh and refetch data
  useRouteRefresh(isCompany ? 'company' : null);
  
  const {
    companyApplications: applications,
    isLoading,
  } = useCompanyApplications(true);

  // Redirect if not authenticated or not a company
  useEffect(() => {
    if (!isAuthenticated || !isCompany) {
      navigate("/auth");
    }
  }, [isAuthenticated, isCompany, navigate]);

  const filteredApplications =
    filterStatus === "all"
      ? applications
      : applications.filter((app) => app.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "reviewed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "shortlisted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "accepted":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
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

  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="company" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Job Applicants
            </h1>
            <p className="text-muted-foreground">
              {applications.length} total application{applications.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-8">
            <Tabs
              value={filterStatus}
              onValueChange={setFilterStatus}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-6 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
                <TabsTrigger value="pending" className="rounded-lg">Pending</TabsTrigger>
                <TabsTrigger value="reviewed" className="rounded-lg">Reviewed</TabsTrigger>
                <TabsTrigger value="shortlisted" className="rounded-lg">Shortlisted</TabsTrigger>
                <TabsTrigger value="accepted" className="rounded-lg">Accepted</TabsTrigger>
                <TabsTrigger value="rejected" className="rounded-lg">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Applications Grid */}
          {filteredApplications.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold mb-2">No applications found</h2>
              <p className="text-muted-foreground">
                No applications match the current filter
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredApplications.map((app) => {
                const student = app.student;
                
                // Type helper to check if student is an object
                const isStudentObject = (student: any): student is { _id: string; user_id: string; full_name: string; email: string; avatar_url?: string; university?: string; degree?: string; graduation_year?: number; location?: string; phone?: string; linkedin_url?: string; github_url?: string; bio?: string; skills?: string[]; } => {
                  return typeof student === 'object' && student !== null && 'full_name' in student;
                };

                const studentObj = isStudentObject(student) ? student : null;
                const studentName = studentObj?.full_name || "Unknown Student";
                const studentEmail = studentObj?.email || "N/A";
                const studentUniversity = studentObj?.university || "N/A";

                return (
                  <Card
                    key={app._id}
                    className="group hover:shadow-elevated transition-all duration-300 cursor-pointer overflow-hidden bg-gradient-card"
                    onClick={() => navigate(`/applications/${app._id}`)}
                  >
                    <CardContent className="p-0">
                      {/* Student Header */}
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {studentObj?.avatar_url ? (
                              <img
                                src={studentObj.avatar_url}
                                alt={studentName}
                                className="w-10 h-10 rounded-xl object-cover ring-2 ring-border shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center ring-2 ring-border shadow-sm">
                                <User className="w-5 h-5 text-primary-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">{studentName}</h3>
                              <p className="text-xs text-muted-foreground">
                                Applied {new Date(app.applied_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={`${getStatusColor(app.status)} flex items-center gap-1 text-xs`}
                          >
                            {getStatusIcon(app.status)}
                            <span className="capitalize">{app.status}</span>
                          </Badge>
                        </div>
                        <h2 className="font-bold text-lg line-clamp-2 leading-tight">
                          {typeof app.internship_id === 'object' && app.internship_id?.title || "Position Applied"}
                        </h2>
                      </div>

                      {/* Applicant Details */}
                      <div className="p-4">
                        {/* Contact Info */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {studentEmail}
                          </Badge>
                          {studentUniversity !== "N/A" && (
                            <Badge variant="outline" className="text-xs">
                              {studentUniversity}
                            </Badge>
                          )}
                        </div>

                        {/* Education Info */}
                        <div className="space-y-2 mb-4">
                          {studentObj?.degree && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="font-medium">Degree:</span> {studentObj.degree}
                            </p>
                          )}
                          {studentObj?.university && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {studentObj.university}
                            </p>
                          )}
                        </div>

                        {/* Cover Letter Preview */}
                        {app.cover_letter && (
                          <div className="mb-4 p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Briefcase className="w-3 h-3 text-muted-foreground" />
                              <p className="text-xs font-semibold">Cover Letter</p>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {app.cover_letter}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/applications/${app._id}`);
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Profile
                          </Button>
                        </div>

                        {/* Application Footer */}
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Application #{app._id.slice(-6).toUpperCase()}</span>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(app.status)}
                              <span>{app.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyApplicants;