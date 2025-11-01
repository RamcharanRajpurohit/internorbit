// frontend/src/pages/Search.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { internshipAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/common/Navigation";
import { Search as SearchIcon, MapPin, DollarSign, Calendar, X } from "lucide-react";
import { toast } from "sonner";

const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [internships, setInternships] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    location: searchParams.get("location") || "",
    remote: searchParams.get("remote") === "true",
    skills: searchParams.get("skills") || "",
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadInternships();
  }, [page]);

  const loadInternships = async () => {
    try {
      setLoading(true);
      const response = await internshipAPI.getAll({
        page,
        limit: 10,
        search: filters.search || undefined,
        location: filters.location || undefined,
        remote: filters.remote || undefined,
        skills: filters.skills || undefined,
      });

      setInternships(response.internships || []);
      setTotal(response.pagination?.total || 0);
    } catch (error: any) {
      toast.error("Failed to load internships");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    
    // Update URL params
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.location) params.set("location", filters.location);
    if (filters.remote) params.set("remote", "true");
    if (filters.skills) params.set("skills", filters.skills);
    setSearchParams(params);
    
    loadInternships();
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      location: "",
      remote: false,
      skills: "",
    });
    setSearchParams(new URLSearchParams());
    setPage(1);
    loadInternships();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="student" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Search Internships
            </h1>
            <p className="text-muted-foreground">
              Find opportunities that match your skills and interests
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <Card className="h-fit shadow-card md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Filters
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Keywords</Label>
                    <Input
                      id="search"
                      placeholder="e.g., Software Engineer"
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., San Francisco"
                      value={filters.location}
                      onChange={(e) =>
                        setFilters({ ...filters, location: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills</Label>
                    <Input
                      id="skills"
                      placeholder="e.g., React, Python"
                      value={filters.skills}
                      onChange={(e) =>
                        setFilters({ ...filters, skills: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remote"
                      checked={filters.remote}
                      onCheckedChange={(checked) =>
                        setFilters({ ...filters, remote: checked as boolean })
                      }
                    />
                    <Label htmlFor="remote" className="cursor-pointer">
                      Remote only
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary"
                  >
                    <SearchIcon className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="md:col-span-3 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-muted-foreground">
                  {loading ? "Loading..." : `${total} results found`}
                </p>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-pulse text-xl text-primary">Loading...</div>
                </div>
              ) : internships.length === 0 ? (
                <Card className="text-center p-12">
                  <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-2xl font-bold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search filters
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </Card>
              ) : (
                <>
                  {internships.map((internship) => {
                    const company = internship.company_id;
                    const companyProfile = company;

                    return (
                      <Card
                        key={internship._id}
                        className="hover:shadow-elevated transition-shadow cursor-pointer"
                        onClick={() => navigate(`/internship/${internship._id}`)}
                      >
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
                                      {companyProfile?.company_name?.[0] || "C"}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    {companyProfile?.company_name || "Company"}
                                  </p>
                                </div>
                              </div>
                              <CardTitle className="text-2xl">{internship.title}</CardTitle>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {internship.description}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {internship.location && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {internship.location}
                              </Badge>
                            )}
                            {internship.is_remote && (
                              <Badge variant="secondary">Remote</Badge>
                            )}
                            {internship.stipend_min && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${internship.stipend_min}-${internship.stipend_max}/mo
                              </Badge>
                            )}
                            {internship.duration_months && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {internship.duration_months} months
                              </Badge>
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
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;