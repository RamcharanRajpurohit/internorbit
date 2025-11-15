import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useDispatch } from 'react-redux';
import { checkAuth } from '@/store/slices/authSlice';
import { fetchInternships } from '@/store/slices/internshipSlice';
import { fetchSavedJobs } from '@/store/slices/savedSlice';
import { fetchStudentApplications } from '@/store/slices/applicationSlice';
import { fetchStudentProfile, fetchCompanyProfile } from '@/store/slices/profileSlice';
import { AppDispatch } from '@/store';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URI;

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isProcessedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (isProcessedRef.current) return;
    isProcessedRef.current = true;

    const handleCallback = async () => {
      try {
        // Get the session from URL callback
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session?.user?.id) {
          throw new Error('No session found. Please try again.');
        }

        // Check if profile exists in backend
        const profileCheckResponse = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (profileCheckResponse.status === 404) {
          // Profile doesn't exist - redirect to auth for role selection
          navigate('/auth?setup=true', { replace: true });
          return;
        }

        if (!profileCheckResponse.ok) {
          throw new Error('Failed to check profile status');
        }

        // Profile exists - get user data
        const profileData = await profileCheckResponse.json();
        const userRole = profileData.profile?.role;

        // Trigger Redux auth state update
        await dispatch(checkAuth(undefined)).unwrap();
        
        // Prefetch ALL critical data based on role to eliminate loaders on other pages
        if (userRole === 'student') {
          // Prefetch all student data in parallel for instant navigation
          Promise.all([
            dispatch(fetchInternships({ page: 1, limit: 50 })),
            dispatch(fetchSavedJobs({ page: 1, limit: 20 })),
            dispatch(fetchStudentApplications({ page: 1, limit: 20 })),
            dispatch(fetchStudentProfile())
          ]).catch(err => console.warn('Prefetch warning:', err)); // Don't block on prefetch errors
        } else if (userRole === 'company') {
          // Prefetch company profile and internships
          Promise.all([
            dispatch(fetchCompanyProfile()),
            // dispatch(fetchCompanyInternships()) // Add if you have this action
          ]).catch(err => console.warn('Prefetch warning:', err));
        }
        
        // Immediate redirect - all data is loading/cached in background
        navigate('/', { replace: true });

      } catch (err: any) {
        console.error('Callback error:', err);
        toast.error(err.message || 'Authentication failed');
        setTimeout(() => navigate('/auth', { replace: true }), 1500);
      }
    };

    handleCallback();
  }, [navigate, dispatch]);

  // Show minimal loader during authentication
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <Card className="w-full max-w-md p-12 shadow-elevated bg-card/95 backdrop-blur-sm text-center">
        <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
        <h2 className="text-xl font-bold mb-2">Signing you in</h2>
        <p className="text-muted-foreground text-sm">Just a moment...</p>
      </Card>
    </div>
  );
};

export default AuthCallback;