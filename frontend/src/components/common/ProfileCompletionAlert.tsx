import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProfileCompletionAlertProps {
  userRole?: "student" | "company";
  onDismiss?: () => void;
}

export function ProfileCompletionAlert({ userRole, onDismiss }: ProfileCompletionAlertProps) {
  const navigate = useNavigate();

  const handleCompleteProfile = () => {
    if (onDismiss) onDismiss();
    navigate(userRole === "company" ? "/company/profile" : "/profile");
  };

  return (
    <Alert variant="default" className="border-primary/50 bg-primary/5 animate-slide-up">
      <AlertCircle className="h-5 w-5 text-primary" />
      <AlertTitle className="text-lg font-semibold">Complete Your Profile</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-4">
          Your profile is incomplete. Please complete your profile to apply for internships and unlock all features.
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handleCompleteProfile}
            className="bg-gradient-primary hover:shadow-glow transition-all"
          >
            Complete Profile
          </Button>
          {onDismiss && (
            <Button variant="ghost" onClick={onDismiss}>
              Later
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
