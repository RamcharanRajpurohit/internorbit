import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useDispatch } from 'react-redux';
import { checkAuth } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URI;

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isProcessedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple executions using both ref and sessionStorage
    // if (isProcessedRef.current) {
    //   console.log('⚠️ AuthCallback already processed (ref), skipping');
    //   return;
    // }

    // if (sessionStorage.getItem('authCallbackProcessed')) {
    //   console.log('⚠️ AuthCallback already processed (sessionStorage), skipping');
    //   return;
    // }

    const handleCallback = async () => {
      try {
        // Get the session from URL callback
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session?.user?.id) {
          throw new Error('No session found. Please try again.');
        }

        console.log('Session found, checking for backend profile...');

        // Check if profile exists in backend
        const profileCheckResponse = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (profileCheckResponse.status === 404) {
          // Profile doesn't exist - redirect to auth for role selection
          console.log('Profile not found, redirecting for role selection...');
          toast.info('Please complete your profile setup');
          
          setTimeout(() => {
            navigate('/auth?setup=true');
          }, 500);
          return;
        }

        if (!profileCheckResponse.ok) {
          throw new Error('Failed to check profile status');
        }

        // Profile exists - user is already set up
        const profileData = await profileCheckResponse.json();
        console.log('Profile found:', profileData.profile);

        // Trigger Redux auth state update
        console.log('🔄 Triggering Redux auth check...');
        await dispatch(checkAuth(undefined)).unwrap();
        console.log('✅ Redux auth check completed');

        // Mark as processed using ref and sessionStorage to prevent re-execution
        isProcessedRef.current = true;
        sessionStorage.setItem('authCallbackProcessed', 'true');

        toast.success('Welcome back!');

        // Redirect to home
        setTimeout(() => {
          console.log('🏠 Redirecting to dashboard...');
          sessionStorage.removeItem('authCallbackProcessed'); // Clear flag for next login
          navigate('/', { replace: true });
        }, 1500);

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
        isProcessedRef.current = true;
        sessionStorage.setItem('authCallbackProcessed', 'true');
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
            Please wait while we verify your account...
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