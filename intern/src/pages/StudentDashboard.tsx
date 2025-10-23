import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SwipeCard from "@/components/SwipeCard";
import Navigation from "@/components/Navigation";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    checkAuth();
    loadInternships();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
  };

  const loadInternships = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get internships user hasn't swiped on yet
      const { data: swipedIds } = await supabase
        .from("swipes")
        .select("internship_id")
        .eq("student_id", user.id);

      const swipedInternshipIds = swipedIds?.map((s) => s.internship_id) || [];

      const query = supabase
        .from("internships")
        .select(`
          *,
          company:company_id (
            full_name,
            company_profiles (
              company_name,
              logo_url
            )
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (swipedInternshipIds.length > 0) {
        query.not("id", "in", `(${swipedInternshipIds.join(",")})`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInternships(data || []);
    } catch (error: any) {
      toast.error("Failed to load internships");
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: "left" | "right") => {
    const currentInternship = internships[currentIndex];
    if (!currentInternship) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Record swipe
      await supabase.from("swipes").insert({
        student_id: user.id,
        internship_id: currentInternship.id,
        direction,
      });

      // If swiped right, save the job
      if (direction === "right") {
        await supabase.from("saved_jobs").insert({
          student_id: user.id,
          internship_id: currentInternship.id,
        });
        toast.success("Internship saved!");
      }

      setCurrentIndex((prev) => prev + 1);
    } catch (error: any) {
      toast.error("Failed to process swipe");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-pulse text-2xl text-primary">Loading...</div>
      </div>
    );
  }

  const currentInternship = internships[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navigation role="student" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Discover Internships
            </h1>
            <p className="text-muted-foreground">
              Swipe right to save, left to skip
            </p>
          </div>

          <div className="relative h-[600px] flex items-center justify-center">
            {currentInternship ? (
              <SwipeCard
                internship={currentInternship}
                onSwipe={handleSwipe}
              />
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
            {internships.length - currentIndex} internships remaining
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;