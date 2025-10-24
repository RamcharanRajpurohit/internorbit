import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, Heart, Zap, TrendingUp } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full mb-6 shadow-card">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Swipe. Match. Grow.</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Find Your Dream
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Internship
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The modern way to discover internships. Swipe through opportunities tailored to your skills and interests. Match with companies that value your potential.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-primary hover:shadow-glow transition-all"
              onClick={() => navigate("/auth")}
            >
              <Heart className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2"
              onClick={() => navigate("/auth")}
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Post Internships
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>1000+ Opportunities</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              <span>Smart Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Instant Applications</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center p-8 rounded-2xl bg-card/80 backdrop-blur-sm shadow-card hover:shadow-elevated transition-all animate-slide-up">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Swipe to Match</h3>
            <p className="text-muted-foreground">
              Discover internships with a familiar, intuitive swipe interface. Right for interested, left to pass.
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl bg-card/80 backdrop-blur-sm shadow-card hover:shadow-elevated transition-all animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Zap className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Smart Suggestions</h3>
            <p className="text-muted-foreground">
              Our algorithm learns your preferences and suggests opportunities that match your skills and goals.
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl bg-card/80 backdrop-blur-sm shadow-card hover:shadow-elevated transition-all animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
              <TrendingUp className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Track Progress</h3>
            <p className="text-muted-foreground">
              Manage your applications, saved opportunities, and connect with companies all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-card rounded-3xl p-12 shadow-elevated">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of students and companies finding perfect matches every day.
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-6 bg-gradient-primary hover:shadow-glow transition-all"
            onClick={() => navigate("/auth")}
          >
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;