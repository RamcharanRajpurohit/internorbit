import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { internshipAPI, interactionAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SwipeCard from "@/components/SwipeCard";
import Navigation from "@/components/Navigation";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    loadInternships();
  }, []);

  // Check if user is logged in
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
  };

  // Load all internships and filter already swiped ones
  const loadInternships = async () => {
    try {
      setLoading(true);

      // Get all active internships
      const response = await internshipAPI.getAll({ page: 1, limit: 50 });

      // Get user's swiped internships
      const swipesResponse = await interactionAPI.getSwipes({ page: 1, limit: 100 });
      const swipedIds = swipesResponse.swipes?.map((s: any) => s.internship_id) || [];

      // Filter out internships already swiped
      const filteredInternships = response.internships.filter(
        (internship: any) => !swipedIds.includes(internship._id)
      );

      setInternships(filteredInternships);
    } catch (error: any) {
      console.error("Error loading internships:", error);
      toast.error(error.message || "Failed to load internships");
    } finally {
      setLoading(false);
    }
  };

  // Handle swipe
  const handleSwipe = async (direction: "left" | "right") => {
    const currentInternship = internships[0];
    if (!currentInternship) return;

    try {
      await interactionAPI.createSwipe(currentInternship._id, direction);

      toast.success(direction === "right" ? "Internship saved!" : "Internship skipped");

      // Remove the internship from the list immediately
      setInternships((prev) => prev.slice(1));
    } catch (error: any) {
      console.error("Error processing swipe:", error);
      toast.error(error.message || "Failed to process swipe");
    }
  };

  const currentInternship = internships[0];

  if (loading) {
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
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Discover Internships
            </h1>
            <p className="text-muted-foreground">Swipe right to save, left to skip</p>
          </div>

          <div className="relative h-[600px] flex items-center justify-center">
            {currentInternship ? (
              <SwipeCard internship={currentInternship} onSwipe={handleSwipe} />
            ) : (
              <div className="text-center animate-scale-in">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-2">You're all caught up!</h2>
                <p className="text-muted-foreground mb-4">
                  No more internships to show right now
                </p>
                <Button
                  onClick={() => navigate("/saved")}
                  className="bg-gradient-primary"
                >
                  View Saved Internships
                </Button>
              </div>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground mt-4">
            {internships.length} internship{internships.length !== 1 ? "s" : ""} remaining
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
