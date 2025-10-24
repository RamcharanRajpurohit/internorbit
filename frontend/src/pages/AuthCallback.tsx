import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from URL callback
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session?.user?.id) {
          throw new Error('No session found. Please try again.');
        }

        console.log('Session found, creating backend profile...');

        // Create profile in backend
        const response = await fetch(`${API_URL}/auth/initialize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            role: session.user.user_metadata?.role || 'student',
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Backend error:', error);
          throw new Error(error.error || 'Failed to create profile');
        }

        console.log('Profile created successfully');
        toast.success('Authentication successful!');

        // Small delay before redirect
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } catch (err: any) {
        console.error('Callback error:', err);
        setError(err.message || 'Authentication failed');
        toast.error(err.message || 'Something went wrong');

        // Redirect to auth after 3 seconds
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Card className="w-full max-w-md p-12 shadow-elevated bg-card/95 backdrop-blur-sm text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <h2 className="text-xl font-bold mb-2">Completing Authentication</h2>
          <p className="text-muted-foreground text-sm">
            Please wait while we set up your account...
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Card className="w-full max-w-md p-12 shadow-elevated bg-card/95 backdrop-blur-sm">
          <div className="text-center">
            <h2 className="text-xl font-bold text-destructive mb-2">Authentication Failed</h2>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <p className="text-xs text-muted-foreground">
              Redirecting to login page...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <Card className="w-full max-w-md p-12 shadow-elevated bg-card/95 backdrop-blur-sm text-center">
        <h2 className="text-xl font-bold mb-2">Welcome!</h2>
        <p className="text-muted-foreground text-sm">Redirecting you now...</p>
      </Card>
    </div>
  );
};

export default AuthCallback;