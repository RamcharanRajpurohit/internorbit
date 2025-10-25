import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Heart, 
  Zap, 
  TrendingUp, 
  Search,
  Users,
  Award,
  Clock,
  CheckCircle,
  Building2,
  GraduationCap,
  ArrowRight
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      {/* Navigation Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              InternMatch
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
            <Button
              className="bg-gradient-primary hover:shadow-glow transition-all"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full mb-6 shadow-card border border-border">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Your Career Starts Here</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Find Your Dream
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Internship
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with top companies, discover opportunities tailored to your skills, 
            and kickstart your career journey with the perfect internship match.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-primary hover:shadow-glow transition-all"
              onClick={() => navigate("/auth")}
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              Find Internships
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2"
              onClick={() => navigate("/auth")}
            >
              <Building2 className="w-5 h-5 mr-2" />
              Post Opportunities
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            <div>
              <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
                1000+
              </div>
              <div className="text-sm text-muted-foreground">Active Internships</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
                500+
              </div>
              <div className="text-sm text-muted-foreground">Companies</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
                10K+
              </div>
              <div className="text-sm text-muted-foreground">Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="bg-gradient-primary bg-clip-text text-transparent">InternMatch</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to find and secure your perfect internship
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center p-8 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all animate-slide-up border border-border">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Smart Search</h3>
            <p className="text-muted-foreground">
              Advanced filters to find internships that match your skills, location, and interests perfectly.
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all animate-slide-up border border-border" style={{ animationDelay: "0.1s" }}>
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Quick Apply</h3>
            <p className="text-muted-foreground">
              One-click applications with your profile. Apply to multiple opportunities in seconds.
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all animate-slide-up border border-border" style={{ animationDelay: "0.2s" }}>
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Track Progress</h3>
            <p className="text-muted-foreground">
              Monitor your applications, get real-time updates, and manage all communications in one place.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It <span className="bg-gradient-primary bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Get started in minutes
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="relative">
            <div className="bg-card p-6 rounded-xl shadow-card border border-border">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4 text-primary-foreground font-bold text-xl">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Create Profile</h3>
              <p className="text-sm text-muted-foreground">
                Sign up and build your professional profile with skills and experience
              </p>
            </div>
            <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-muted-foreground" />
          </div>

          <div className="relative">
            <div className="bg-card p-6 rounded-xl shadow-card border border-border">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4 text-primary-foreground font-bold text-xl">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">Browse & Search</h3>
              <p className="text-sm text-muted-foreground">
                Explore hundreds of internships or use smart filters to find perfect matches
              </p>
            </div>
            <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-muted-foreground" />
          </div>

          <div className="relative">
            <div className="bg-card p-6 rounded-xl shadow-card border border-border">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4 text-primary-foreground font-bold text-xl">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Apply Instantly</h3>
              <p className="text-sm text-muted-foreground">
                Submit applications with one click using your profile information
              </p>
            </div>
            <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-muted-foreground" />
          </div>

          <div>
            <div className="bg-card p-6 rounded-xl shadow-card border border-border">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4 text-primary-foreground font-bold text-xl">
                4
              </div>
              <h3 className="font-bold text-lg mb-2">Get Hired</h3>
              <p className="text-sm text-muted-foreground">
                Connect with companies, interview, and land your dream internship
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                For <span className="bg-gradient-primary bg-clip-text text-transparent">Students</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Personalized Matches</h3>
                    <p className="text-muted-foreground">Get internship recommendations based on your skills and interests</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Application Tracking</h3>
                    <p className="text-muted-foreground">Monitor all your applications in one centralized dashboard</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Direct Company Contact</h3>
                    <p className="text-muted-foreground">Connect directly with hiring managers and recruiters</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Career Resources</h3>
                    <p className="text-muted-foreground">Access tips, guides, and resources to boost your career</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                For <span className="bg-gradient-primary bg-clip-text text-transparent">Companies</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Quality Candidates</h3>
                    <p className="text-muted-foreground">Access a pool of motivated, pre-screened students</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Easy Management</h3>
                    <p className="text-muted-foreground">Post internships and manage applicants effortlessly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Brand Visibility</h3>
                    <p className="text-muted-foreground">Showcase your company to thousands of talented students</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Analytics & Insights</h3>
                    <p className="text-muted-foreground">Track application metrics and optimize your hiring process</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-card rounded-3xl p-12 shadow-elevated border border-border">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students and companies building successful careers together. 
            Start matching today—it's completely free!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-primary hover:shadow-glow transition-all"
              onClick={() => navigate("/auth")}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2"
              onClick={() => navigate("/help")}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">InternMatch</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting talented students with amazing opportunities.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">For Students</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Find Internships</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Career Resources</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Success Stories</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">For Companies</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Post Internships</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Hire Talent</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" onClick={() => navigate("/help")} className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" onClick={() => navigate("/contact")} className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2025 InternMatch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;