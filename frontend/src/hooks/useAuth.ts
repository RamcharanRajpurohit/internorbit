import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store';
import {
  checkAuth,
  updateProfile,
  signOut,
  clearError,
  setInitialAuthCheck,
  updateUser,
} from '@/store/slices/authSlice';
import { useUpdateProfile } from './useReactQuery';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux state
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    initialAuthCheck,
  } = useSelector((state: RootState) => state.auth);

  // Debug logging (only log when state actually changes)
  const debugInfo = {
    user: user ? `${user.email} (${user.role})` : null,
    isLoading,
    isAuthenticated,
    error,
    initialAuthCheck
  };

  // Mutations
  const updateProfileMutation = useUpdateProfile();

  // Effects
  useEffect(() => {
    // Only check auth if we haven't done initial check
    // Redux persist will restore user from localStorage automatically
    if (!initialAuthCheck) {
      // If we have persisted user data, mark as checked without API call
      if (user) {
        dispatch(setInitialAuthCheck());
      } else {
        // Only make API call if no persisted data
        dispatch(checkAuth(undefined));
      }
    }
  }, [dispatch, initialAuthCheck, user]);

  // Removed React Query effect - Redux handles user data
  // useEffect(() => {
  //   if (currentUserQuery.data && !user) {
  //     dispatch(updateUser(currentUserQuery.data));
  //   }
  // }, [currentUserQuery.data, user, dispatch]);

  // Auth actions
  const handleUpdateProfile = async (profileData: any) => {
    try {
      await updateProfileMutation.mutateAsync(profileData);
      await dispatch(updateProfile(profileData)).unwrap();
    } catch (error: any) {
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await dispatch(signOut(undefined)).unwrap();
      navigate('/');
    } catch (error: any) {
      throw error;
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  // User role helpers
  const isStudent = user?.role === 'student';
  const isCompany = user?.role === 'company';
  const isProfileComplete = user?.profile_complete;

  return {
    // State
    user,
    isLoading, // Removed currentUserQuery.isLoading
    isAuthenticated,
    error, // Removed currentUserQuery.error
    initialAuthCheck,
    isStudent,
    isCompany,
    isProfileComplete,

    // Actions
    updateProfile: handleUpdateProfile,
    signOut: handleSignOut,
    clearError: clearAuthError,
    refetch: () => dispatch(checkAuth(undefined)), // Use Redux instead of React Query
  };
};

export default useAuth;