import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentApplications } from "@/hooks/useApplications";
import { useAuth } from "@/hooks/useAuth";
import { useRouteRefresh } from "@/hooks/useRouteRefresh";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Navigation from "@/components/common/Navigation";
import { getCompanyData, getInternshipData } from "@/lib/dataNormalization";
import { APPLICATION_STATUS, APPLICATION_STATUS_OPTIONS, getApplicationStatusInfo } from "@/constants/applicationStatus";
import {
  Calendar, MapPin, Trash2, Building, Clock,
  Eye, CheckCircle, XCircle, AlertCircle,
  FileText, DollarSign
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "@/components/ui/Loader";
import type { ApplicationStatus } from "@/types";

const Applications = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"all" | ApplicationStatus>("all");
  const [page, setPage] = useState(1);

  // Use our new state management hooks
  const { isAuthenticated, isStudent } = useAuth();
  
  // Detect browser refresh and refetch data
  useRouteRefresh(isStudent ? 'student' : null);
  
  const {
    studentApplications: applications,
    isLoading,
    withdrawApplication: withdraw,
    pagination,
  } = useStudentApplications(true);

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!isAuthenticated || !isStudent) {
      navigate("/auth");
    }
  }, [isAuthenticated, isStudent, navigate]);

  // Fetch applications when status or page changes
  const applicationsData = applications.filter(app =>
    status === "all" || app.status === status
  );

  const total = pagination?.total || 0;

  const handleWithdraw = async (applicationId: string) => {
    try {
      await withdraw(applicationId);
      toast.success("Application withdrawn");
    } catch (error: any) {
      toast.error("Failed to withdraw application");
    }
  };

  const getStatusInfo = (appStatus: ApplicationStatus) => {
    const statusConfig = getApplicationStatusInfo(appStatus);
    const iconMap = {
      pending: <Clock className="w-4 h-4" />,
      reviewed: <Eye className="w-4 h-4" />,
      shortlisted: <AlertCircle className="w-4 h-4" />,
      accepted: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
    };

    return {
      color: statusConfig.color,
      icon: iconMap[appStatus] || <Clock className="w-4 h-4" />,
      label: statusConfig.label,
    };
  };

  
  // Remove full-page loader - show skeleton instead
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="student" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              My Applications
            </h1>
            <p className="text-muted-foreground">
              {total} total applications
            </p>
          </div>

          <Tabs value={status} onValueChange={(value) => { setStatus(value as "all" | ApplicationStatus); setPage(1); }} className="mb-8">
            <div className="overflow-x-auto -mx-4 px-4">
              <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-6">
                <TabsTrigger value="all" className="flex-shrink-0">All</TabsTrigger>
                {APPLICATION_STATUS_OPTIONS.map((statusOption) => (
                  <TabsTrigger key={statusOption.value} value={statusOption.value} className="flex-shrink-0">
                    {statusOption.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>

          {applicationsData.length === 0 && !isLoading ? (
            <div className="text-center py-20">
            
              <h2 className="text-2xl font-bold mb-2">No applications yet</h2>
              <p className="text-muted-foreground mb-4">
                Start browsing internships and apply to positions you're interested in
              </p>
              <Button onClick={() => navigate("/")} className="bg-gradient-primary">
                Discover Internships
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Show skeleton loaders while loading */}
              {isLoading && applicationsData.length === 0 ? (
                <>
                  {[...Array(8)].map((_, index) => (
                    <Card key={`skeleton-${index}`} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4 border-b border-border animate-pulse">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 space-y-2">
                              <div className="h-5 bg-muted rounded w-3/4"></div>
                              <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                            <div className="w-20 h-6 bg-muted rounded-full"></div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="h-3 bg-muted rounded w-full"></div>
                          <div className="h-3 bg-muted rounded w-5/6"></div>
                          <div className="flex gap-2 mt-4">
                            <div className="h-8 bg-muted rounded flex-1"></div>
                            <div className="h-8 bg-muted rounded w-10"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <>
              {applicationsData.map((app) => {
                const internship = getInternshipData(app);
                const company = internship ? getCompanyData(internship) : null;
                const statusInfo = getStatusInfo(app.status);

                if (!internship) {
                  return (
                    <Card key={app._id} className="group hover:shadow-elevated transition-all duration-300 cursor-pointer overflow-hidden bg-gradient-card">
                      <CardContent className="p-0">
                        <div className="p-4 border-b border-border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg line-clamp-2 leading-tight">Internship Unavailable</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Applied {new Date(app.applied_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={`${statusInfo.color} text-primary-foreground flex items-center gap-1`}>
                              {statusInfo.icon}
                              <span className="text-xs">{statusInfo.label}</span>
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground">
                            Internship details are no longer available
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <Card
                    key={app._id}
                    className="group hover:shadow-elevated transition-all duration-300 cursor-pointer overflow-hidden bg-gradient-card"
                  >
                    <CardContent className="p-0">
                      {/* Company Header */}
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center gap-3 mb-3">
                          {company?.logo_url ? (
                            <img
                              src={company.logo_url}
                              alt={company.company_name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-secondary flex items-center justify-center ring-2 ring-border">
                              <Building className="w-5 h-5 text-secondary-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{company?.company_name || 'Company'}</h3>
                            <p className="text-xs text-muted-foreground">
                              Applied {new Date(app.applied_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={`${statusInfo.color} text-primary-foreground flex items-center gap-1`}>
                            {statusInfo.icon}
                            <span className="text-xs">{statusInfo.label}</span>
                          </Badge>
                        </div>
                        <h2 className="font-bold text-lg line-clamp-2 leading-tight">
                          {internship.title}
                        </h2>
                      </div>

                      {/* Application Details */}
                      <div className="p-4">
                        {/* Quick Info Badges */}
                        {/* <div className="flex flex-wrap gap-1.5 mb-4">
                          {internship.location && (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {internship.location}
                            </Badge>
                          )}
                          {internship.is_remote && (
                            <Badge variant="secondary" className="text-xs">Remote</Badge>
                          )}
                          {internship.stipend_min && (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${internship.stipend_min}-{internship.stipend_max || internship.stipend_min}
                            </Badge>
                          )}
                          {internship.duration_months && (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {internship.duration_months}m
                            </Badge>
                          )}
                        </div> */}

                        {/* Cover Letter Preview */}
                        {app.cover_letter && (
                          <div className="mb-4 p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-3 h-3 text-muted-foreground" />
                              <p className="text-xs font-semibold">Cover Letter</p>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {app.cover_letter}
                            </p>
                          </div>
                        )}

                        {/* Skills Preview */}
                        {/* {internship.skills_required && internship.skills_required.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {internship.skills_required.slice(0, 3).map((skill: string, skillIndex: number) => (
                                <Badge key={skillIndex} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {internship.skills_required.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{internship.skills_required.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )} */}

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/internship/${internship._id}`);
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          {app.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWithdraw(app._id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>

                        {/* Application Status Footer */}
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Application #{app._id.slice(-6).toUpperCase()}</span>
                            <div className="flex items-center gap-1">
                              {statusInfo.icon}
                              <span>{statusInfo.label}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
                </>
              )}
            </div>
          )}

          {/* Pagination */}
          {applicationsData.length > 0 && (
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
          )}
        </div>
      </main>
    </div>
  );
};

export default Applications;
