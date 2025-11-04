import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/common/Navigation";
import { toast } from "sonner";
import { applicationAPI } from "@/lib/api";
import { getSession } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, XCircle, Briefcase } from "lucide-react";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="company" />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Applications
            </h1>
            <p className="text-gray-600">
              {applications.length} total application{applications.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Filter Tabs */}
          <Card className="p-3 sm:p-4 mb-6 bg-white shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <Tabs
                value={filterStatus}
                onValueChange={setFilterStatus}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid grid-cols-3 sm:flex w-full sm:w-auto gap-1">
                  <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending</TabsTrigger>
                  <TabsTrigger value="reviewed" className="text-xs sm:text-sm">Reviewed</TabsTrigger>
                  <TabsTrigger value="shortlisted" className="text-xs sm:text-sm">Shortlisted</TabsTrigger>
                  <TabsTrigger value="accepted" className="text-xs sm:text-sm">Accepted</TabsTrigger>
                  <TabsTrigger value="rejected" className="text-xs sm:text-sm">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </Card>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center bg-white shadow-sm">
              <p className="text-lg sm:text-xl text-gray-500">
                No applications found
              </p>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredApplications.map((app, idx) => {
                const student = app.student;
                const studentName = student?.full_name || "Unknown Student";
                const studentEmail = student?.email || "N/A";
                const studentUniversity = student?.university || "N/A";

                return (
                  <Card
                    key={app._id}
                    className="p-4 sm:p-6 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200"
                    onClick={() => navigate(`/applications/${app._id}`)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Left Side - Student Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          {student?.avatar_url ? (
                            <img
                              src={student.avatar_url}
                              alt={studentName}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm sm:text-lg">
                                {getInitials(studentName)}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                              {studentName}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                              {studentEmail}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2 mb-3">
                          <div className="flex items-start gap-2">
                            <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs sm:text-sm text-gray-700">
                              <span className="font-medium">Position:</span>{" "}
                              {app.internship_id?.title || "N/A"}
                            </p>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 pl-6">
                            <span className="font-medium">University:</span> {studentUniversity}
                          </p>
                          {student?.degree && (
                            <p className="text-xs sm:text-sm text-gray-600 pl-6">
                              <span className="font-medium">Degree:</span> {student.degree}
                            </p>
                          )}
                        </div>

                        <p className="text-xs text-gray-500">
                          Applied on{" "}
                          {new Date(app.applied_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      {/* Right Side - Status Badge */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-3">
                        <Badge
                          className={`${getStatusColor(app.status)} flex items-center gap-1.5 px-3 py-1`}
                        >
                          {getStatusIcon(app.status)}
                          <span className="capitalize text-xs sm:text-sm">
                            {app.status}
                          </span>
                        </Badge>
                      </div>
                    </div>
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