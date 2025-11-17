import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProfileCompletionAlertProps {
  userRole?: "student" | "company";
  onDismiss?: () => void;
  missingFields?: {
    bio?: boolean;
    university?: boolean;
    degree?: boolean;
    graduation_year?: boolean;
    location?: boolean;
    skills?: boolean;
    phone?: boolean;
    company_name?: boolean;
    description?: boolean;
    website?: boolean;
    industry?: boolean;
    company_size?: boolean;
  };
}

export function ProfileCompletionAlert({ userRole, onDismiss, missingFields }: ProfileCompletionAlertProps) {
  const navigate = useNavigate();

  const handleCompleteProfile = () => {
    if (onDismiss) onDismiss();
    navigate(userRole === "company" ? "/company/profile" : "/profile");
  };

  // Create a readable list of missing fields
  const getMissingFieldsList = () => {
    if (!missingFields) return null;

    const fieldLabels: Record<string, string> = {
      bio: "Bio (min 5 characters)",
      university: "University",
      degree: "Degree",
      graduation_year: "Graduation Year",
      location: "Location",
      skills: "Skills (at least 1)",
      phone: "Phone Number",
      company_name: "Company Name",
      description: "Company Description (min 5 characters)",
      website: "Website",
      industry: "Industry",
      company_size: "Company Size",
    };

    const missing = Object.entries(missingFields)
      .filter(([_, isMissing]) => isMissing)
      .map(([field]) => fieldLabels[field] || field);

    return missing.length > 0 ? missing : null;
  };

  const missingList = getMissingFieldsList();

  return (
    <Alert variant="default" className="border-primary/50 bg-primary/5 animate-slide-up">
      <AlertCircle className="h-5 w-5 text-primary" />
      <AlertTitle className="text-lg font-semibold">Complete Your Profile</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          {missingList 
            ? "Please complete the following required fields to apply for internships:"
            : "Your profile is incomplete. Please complete your profile to apply for internships and unlock all features."}
        </p>
        
        {missingList && (
          <ul className="list-disc list-inside mb-4 space-y-1 text-sm">
            {missingList.map((field, index) => (
              <li key={index} className="text-muted-foreground">{field}</li>
            ))}
          </ul>
        )}

        <p className="text-xs text-muted-foreground mb-4 italic">
          Note: Projects and work experience are optional and not required for profile completion.
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
