import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { fetchInternships, fetchCompanyInternships } from '@/store/slices/internshipSlice';
import { fetchStudentApplications, fetchCompanyApplications } from '@/store/slices/applicationSlice';
import { fetchStudentProfile, fetchCompanyProfile } from '@/store/slices/profileSlice';
import { fetchSavedJobs } from '@/store/slices/savedSlice';

// Global flag to track if we've already checked for browser refresh
// This ensures we only check ONCE per app session, not on every component mount
let hasCheckedForRefresh = false;

/**
 * Hook to detect browser refresh (F5, Ctrl+R, etc.) and refetch route-specific data
 * Does NOT trigger on navigation - only on actual browser refresh
 */
export const useRouteRefresh = (userRole: 'student' | 'company' | null) => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    // Only check for refresh ONCE per app session (not per component mount)
    if (!hasCheckedForRefresh) {
      hasCheckedForRefresh = true;
      
      // Check if this is a browser refresh by checking navigation type
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const isRefresh = navigationEntries.length > 0 && navigationEntries[0].type === 'reload';
      
      if (isRefresh && userRole) {
        console.log('🔄 Browser refresh detected on:', location.pathname);
        refetchRouteData(location.pathname, userRole, dispatch);
      } else {
        console.log('✅ Initial app load (not a refresh), using cached data');
      }
      
      prevPathname.current = location.pathname;
      return;
    }

    // On subsequent effects, only update if pathname actually changed (navigation)
    if (prevPathname.current !== location.pathname) {
      console.log('🧭 Navigation detected from', prevPathname.current, 'to', location.pathname, '- NO refetch');
      prevPathname.current = location.pathname;
      // DO NOT refetch on navigation - only on refresh
    }
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
    
    // Saved jobs page
    else if (pathname === '/saved' && userRole === 'student') {
      console.log('💾 Refetching saved jobs...');
      await dispatch(fetchSavedJobs({ page: 1, limit: 100 }));
    }
    
    // Applications page
    else if (pathname === '/applications') {
      console.log('📝 Refetching applications...');
      if (userRole === 'student') {
        await dispatch(fetchStudentApplications({ page: 1, limit: 100 }));
      } else if (userRole === 'company') {
        await dispatch(fetchCompanyApplications({ page: 1, limit: 100 }));
      }
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
    
    // Company internships page
    else if (pathname === '/company/internships' && userRole === 'company') {
      console.log('💼 Refetching company internships...');
      await dispatch(fetchCompanyInternships({}));
    }
    
    // Company applicants page
    else if (pathname === '/company/applicants' && userRole === 'company') {
      console.log('👥 Refetching company applicants...');
      await dispatch(fetchCompanyApplications({ page: 1, limit: 100 }));
    }
    
    // Company dashboard
    else if (pathname === '/company' && userRole === 'company') {
      console.log('📊 Refetching company dashboard data...');
      await Promise.all([
        dispatch(fetchCompanyInternships({})),
        dispatch(fetchCompanyApplications({ page: 1, limit: 100 })),
        dispatch(fetchCompanyProfile())
      ]);
    }
    
    // Internship detail page
    else if (pathname.startsWith('/internship/')) {
      console.log('🔍 Refetching internship details...');
      // The individual page component will handle fetching specific internship
      // We just need to ensure the list is fresh
      await dispatch(fetchInternships({ page: 1, limit: 50 }));
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
