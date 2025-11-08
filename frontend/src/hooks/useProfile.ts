import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  fetchStudentProfile,
  updateStudentProfile,
  fetchCompanyProfile,
  updateCompanyProfile,
} from '@/store/slices/profileSlice';
import { clearProfileError } from '@/store/slices/profileSlice';
import { useAuth } from './useAuth';

export const useStudentProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isStudent } = useAuth();

  // Redux state
  const {
    studentProfile,
    isLoading,
    isUpdating,
    error,
  } = useSelector((state: RootState) => state.profile);

  // Effects
  useEffect(() => {
    if (isAuthenticated && isStudent && !studentProfile) {
      dispatch(fetchStudentProfile(undefined));
    }
  }, [dispatch, isAuthenticated, isStudent, studentProfile]);

  // Actions
  const handleUpdateProfile = async (profileData: any) => {
    try {
      const result = await dispatch(updateStudentProfile(profileData)).unwrap();
      return result;
    } catch (error: any) {
      throw error;
    }
  };

  const clearError = () => {
    dispatch(clearProfileError());
  };

  return {
    studentProfile,
    isLoading,
    isUpdating,
    error,
    updateProfile: handleUpdateProfile,
    clearError,
    refetch: () => dispatch(fetchStudentProfile(undefined)),
  };
};

export const useCompanyProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isCompany } = useAuth();

  // Redux state
  const {
    companyProfile,
    isLoading,
    isUpdating,
    error,
  } = useSelector((state: RootState) => state.profile);

  // Effects
  useEffect(() => {
    if (isAuthenticated && isCompany && !companyProfile) {
      dispatch(fetchCompanyProfile(undefined));
    }
  }, [dispatch, isAuthenticated, isCompany, companyProfile]);

  // Actions
  const handleUpdateProfile = async (profileData: any) => {
    try {
      const result = await dispatch(updateCompanyProfile(profileData)).unwrap();
      return result;
    } catch (error: any) {
      throw error;
    }
  };

  const clearError = () => {
    dispatch(clearProfileError());
  };

  return {
    companyProfile,
    isLoading,
    isUpdating,
    error,
    updateProfile: handleUpdateProfile,
    clearError,
    refetch: () => dispatch(fetchCompanyProfile(undefined)),
  };
};

export default useStudentProfile;