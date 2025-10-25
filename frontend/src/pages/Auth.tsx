import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, Chrome, ArrowLeft, UserCircle, Building2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URI;

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [showOTP, setShowOTP] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "company">("student");
  const [otp, setOtp] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");

  // Check for OAuth setup parameter (redirected from callback)
  useEffect(() => {
    const setupParam = searchParams.get('setup');
    
    const handleOAuthSetup = async () => {
      if (setupParam === 'true') {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session?.user && !error) {
            // User needs to complete setup, show role selection
            setGoogleUserData({
              user: session.user,
              token: session.access_token,
            });
            setShowRoleSelection(true);
          } else {
            // No session found
            toast.error('Session expired. Please sign in again.');
            navigate('/auth');
          }
        } catch (error) {
          console.error('OAuth setup error:', error);
          toast.error('Something went wrong. Please try again.');
        }
      }
    };

    handleOAuthSetup();
  }, [searchParams, navigate]);

  // Check for OAuth setup parameter (redirected from callback)
  useEffect(() => {
    const setupParam = searchParams.get('setup');
    
    const handleOAuthSetup = async () => {
      if (setupParam === 'true') {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session?.user && !error) {
            // User needs to complete setup, show role selection
            setGoogleUserData({
              user: session.user,
              token: session.access_token,
            });
            setShowRoleSelection(true);
          } else {
            // No session found
            toast.error('Session expired. Please sign in again.');
            navigate('/auth');
          }
        } catch (error) {
          console.error('OAuth setup error:', error);
          toast.error('Something went wrong. Please try again.');
        }
      }
    };

    handleOAuthSetup();
  }, [searchParams, navigate]);

  // Handle role selection after Google OAuth
  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!googleUserData?.user || !googleUserData?.token) {
        throw new Error('Session expired. Please try again.');
      }

      // Create backend profile with selected role
      await createBackendProfile(
        googleUserData.user.id,
        googleUserData.token,
        {
          email: googleUserData.user.email,
          full_name: googleUserData.user.user_metadata?.full_name || 
                     googleUserData.user.user_metadata?.name ||
                     googleUserData.user.email?.split('@')[0],
          role,
        }
      );

      toast.success('Account setup complete!');
      setShowRoleSelection(false);
      setGoogleUserData(null);

      // Navigate to home - the Index component will detect the session and show dashboard
      window.location.href = '/';
    } catch (error: any) {
      console.error('Role submission error:', error);
      toast.error(error.message || 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  // Create profile in backend
  const createBackendProfile = async (userId: string, token: string, userData: any) => {
    try {
      const response = await fetch(`${API_URL}/auth/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: userId,
          email: userData.email || email,
          full_name: userData.full_name || fullName,
          role: userData.role || role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create profile');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Backend profile creation failed:', error);
      throw error;
    }
  };



  // Google OAuth Sign In/Up
  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast.error(error.message || 'Google authentication failed');
      setLoading(false);
    }
  };

  // Email/Password Sign Up with OTP
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Send OTP
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (otpError) throw otpError;

      toast.success('OTP sent to your email');
      setShowOTP(true);
      setPhoneOrEmail(email);
    } catch (error: any) {
      console.error('OTP error:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and Create Profile
  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Verify OTP
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: phoneOrEmail,
        token: otp,
        type: 'email',
      });

      if (verifyError) throw verifyError;

      if (!data.user?.id || !data.session?.access_token) {
        throw new Error('Failed to verify OTP');
      }

      // Step 2: Create backend profile
      await createBackendProfile(data.user.id, data.session.access_token, {
        email: data.user.email,
        full_name: fullName,
        role,
      });

      toast.success('Account created successfully!');
      setShowOTP(false);
      setEmail("");
      setPassword("");
      setFullName("");
      setOtp("");

      // Use window.location to force a full page reload and state refresh
      window.location.href = '/';
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Sign In
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user?.id || !data.session?.access_token) {
        throw new Error('Sign in failed');
      }

      // Create backend profile if doesn't exist
      try {
        await createBackendProfile(data.user.id, data.session.access_token, {
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || email.split('@')[0],
          role: data.user.user_metadata?.role || 'student',
        });
      } catch (err) {
        // Profile might already exist, continue anyway
        console.log('Profile may already exist');
      }

      toast.success('Welcome back!');
      setEmail("");
      setPassword("");

      // Use window.location to force a full page reload and state refresh
      window.location.href = '/';
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    if (isSignUp) {
      handleEmailSignUp(e);
    } else {
      handlePasswordSignIn(e);
    }
  };

  // Role Selection Screen (for Google OAuth)
  if (showRoleSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
        </div>

        <Card className="w-full max-w-md p-8 shadow-elevated bg-card/95 backdrop-blur-sm relative z-10 animate-scale-in">
          <div className="text-center mb-8">
            <UserCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
            <p className="text-sm text-muted-foreground">
              Tell us who you are to get started
            </p>
          </div>

          <form onSubmit={handleRoleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base">I am a:</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as "student" | "company")}>
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="student" id="student-role" disabled={loading} />
                  <Label htmlFor="student-role" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <UserCircle className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold">Student</div>
                        <div className="text-xs text-muted-foreground">
                          Looking for internship opportunities
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="company" id="company-role" disabled={loading} />
                  <Label htmlFor="company-role" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold">Company</div>
                        <div className="text-xs text-muted-foreground">
                          Hiring talented interns
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:shadow-glow transition-all"
              disabled={loading}
            >
              {loading ? "Setting up..." : "Continue"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // OTP Form
  if (showOTP) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
        </div>

        <Card className="w-full max-w-md p-8 shadow-elevated bg-card/95 backdrop-blur-sm relative z-10 animate-scale-in">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowOTP(false);
              setOtp("");
              setEmail("");
            }}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center mb-8">
            <Mail className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Enter OTP</h2>
            <p className="text-sm text-muted-foreground">
              We sent an OTP to {phoneOrEmail}
            </p>
          </div>

          <form onSubmit={handleOTPVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Password</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                disabled={loading}
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code from your email
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Didn't receive the code? Check spam folder
            </p>
          </form>
        </Card>
      </div>
    );
  }

  // Main Auth Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
      </div>

      <Card className="w-full max-w-md p-8 shadow-elevated bg-card/95 backdrop-blur-sm relative z-10 animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            InternMatch
          </h1>
          <p className="text-muted-foreground">
            {isSignUp ? "Start your journey today" : "Welcome back!"}
          </p>
        </div>

        {/* Google OAuth Button */}
        <Button
          onClick={handleGoogleAuth}
          disabled={loading}
          variant="outline"
          className="w-full mb-4 border-2"
        >
          <Chrome className="w-4 h-4 mr-2" />
          Continue with Google
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(v) => setIsSignUp(v === "signup")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="signin">Sign In</TabsTrigger>
          </TabsList>

          <TabsContent value="signup">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-3">
                <Label>I am a:</Label>
                <RadioGroup value={role} onValueChange={(v) => setRole(v as "student" | "company")}>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary transition-colors">
                    <RadioGroupItem value="student" id="student" disabled={loading} />
                    <Label htmlFor="student" className="flex-1 cursor-pointer">
                      Student looking for internships
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary transition-colors">
                    <RadioGroupItem value="company" id="company" disabled={loading} />
                    <Label htmlFor="company" className="flex-1 cursor-pointer">
                      Company hiring interns
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:shadow-glow transition-all"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Sign Up with Email"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By signing up, you agree to our Terms of Service
              </p>
            </form>
          </TabsContent>

          <TabsContent value="signin">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:shadow-glow transition-all"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;