import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { fetchInternships } from '@/store/slices/internshipSlice';
import { fetchStudentApplications, fetchCompanyApplications } from '@/store/slices/applicationSlice';
import { fetchStudentProfile, fetchCompanyProfile } from '@/store/slices/profileSlice';
import { fetchSavedJobs } from '@/store/slices/savedSlice';

/**
 * Hook to detect browser refresh (F5, Ctrl+R, etc.) and refetch route-specific data
 * Triggers on browser refresh to ensure fresh data from server
 */
export const useRouteRefresh = (userRole: 'student' | 'company' | null) => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const hasRefreshed = useRef(false);
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    // Check if this is a browser refresh by checking navigation type
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const isRefresh = navigationEntries.length > 0 && navigationEntries[0].type === 'reload';
    
    // Only refetch if:
    // 1. It's a browser refresh (reload)
    // 2. We haven't already refreshed for this component
    // 3. User role is available
    if (isRefresh && !hasRefreshed.current && userRole) {
      hasRefreshed.current = true;
      console.log('🔄 Browser refresh detected on:', location.pathname);
      refetchRouteData(location.pathname, userRole, dispatch);
    }

    // Update previous pathname for navigation tracking
    prevPathname.current = location.pathname;
  }, [location.pathname, userRole, dispatch]);
};

/**
 * Refetch data based on current route
 */
const refetchRouteData = async (pathname: string, userRole: 'student' | 'company', dispatch: AppDispatch) => {
  try {
    // Dashboard routes
    if (pathname === '/' || pathname === '/dashboard') {
      if (userRole === 'student') {
        console.log('📊 Refetching student dashboard data...');
        await Promise.all([
          dispatch(fetchInternships({ page: 1, limit: 50 })),
          dispatch(fetchSavedJobs({ page: 1, limit: 100 })),
          dispatch(fetchStudentApplications({ page: 1, limit: 100 })),
          dispatch(fetchStudentProfile())
        ]);
      } else if (userRole === 'company') {
        console.log('📊 Refetching company dashboard data...');
        await Promise.all([
          dispatch(fetchCompanyApplications({ page: 1, limit: 50 })),
          dispatch(fetchCompanyProfile())
        ]);
      }
    }
    
    // Saved jobs page (student only)
    else if (pathname === '/saved' && userRole === 'student') {
      console.log('💾 Refetching saved jobs...');
      await dispatch(fetchSavedJobs({ page: 1, limit: 100 }));
    }
    
    // Applications page (both student and company)
    else if (pathname === '/applications') {
      console.log('📝 Refetching applications...');
      if (userRole === 'student') {
        await dispatch(fetchStudentApplications({ page: 1, limit: 100 }));
      } else if (userRole === 'company') {
        await dispatch(fetchCompanyApplications({ page: 1, limit: 100 }));
      }
    }
    
    // Company applicants page
    else if (pathname === '/company/applicants' && userRole === 'company') {
      console.log('📝 Refetching company applicants...');
      await dispatch(fetchCompanyApplications({ page: 1, limit: 100 }));
    }
    
    // Company internships page
    else if (pathname === '/company/internships' && userRole === 'company') {
      console.log('💼 Refetching company internships...');
      // Company internships are managed separately - no Redux fetch action yet
      // The component will handle its own data fetching
      console.log('ℹ️  Company internships managed by component');
    }
    
    // Profile pages
    else if (pathname === '/profile' || pathname === '/company/profile') {
      console.log('👤 Refetching profile...');
      if (userRole === 'student') {
        await dispatch(fetchStudentProfile());
      } else if (userRole === 'company') {
        await dispatch(fetchCompanyProfile());
      }
    }
    
    // Internship detail page (student)
    else if (pathname.startsWith('/internship/')) {
      console.log('🔍 Refetching internship details...');
      // The individual page component will handle fetching specific internship
      // We ensure the list is fresh for navigation
      await dispatch(fetchInternships({ page: 1, limit: 50 }));
    }
    
    // Application detail page (company)
    else if (pathname.startsWith('/applications/') && userRole === 'company') {
      console.log('📄 Refetching application detail...');
      await dispatch(fetchCompanyApplications({ page: 1, limit: 100 }));
    }
    
    // Search/Explore pages
    else if (pathname === '/search' || pathname === '/explore') {
      console.log('🔎 Refetching search results...');
      await dispatch(fetchInternships({ page: 1, limit: 50 }));
    }

    console.log('✅ Route data refresh completed');
  } catch (error) {
    console.error('❌ Error refreshing route data:', error);
  }
};
