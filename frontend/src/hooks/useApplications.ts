import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  fetchStudentApplications,
  fetchCompanyApplications,
  createApplication,
  updateApplicationStatus,
  withdrawApplication,
  fetchApplicationById,
  clearApplicationError,
} from '@/store/slices/applicationSlice';
import { addApplicationToList, removeApplicationFromList } from '@/store/slices/applicationSlice';
import { toggleAppliedStatus, updateApplicationsCount } from '@/store/slices/internshipSlice';
import { useAuth } from './useAuth';
import { add } from 'date-fns';

export const useStudentApplications = (autoFetch = true) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isStudent } = useAuth();

  const {
    studentApplications,
    currentApplication,
    isLoading,
    isSubmitting,
    isUpdating,
    error,
    pagination,
  } = useSelector((state: RootState) => state.application);

  useEffect(() => {
    if (autoFetch && isAuthenticated && isStudent && !studentApplications.length) {
      dispatch(fetchStudentApplications({}));
    }
  }, [dispatch, autoFetch, isAuthenticated, isStudent, studentApplications.length]);

  const handleFetchApplications = useCallback(
    async (params?: { page?: number; limit?: number; status?: string }) => {
      try {
        return await dispatch(fetchStudentApplications(params)).unwrap();
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch]
  );

  const handleCreateApplication = useCallback(
    async (applicationData: {
      internship_id: string;
      resume_id: string;
      cover_letter: string;
    }, internshipData?: any) => {
      try {
        const result = await dispatch(createApplication({ applicationData, internshipData })).unwrap();
        dispatch(addApplicationToList(result));
        return result;
        // The thunk automatically dispatches toggleAppliedStatus to internshipSlice
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch]
  );

  const handleWithdrawApplication = useCallback(
    async (applicationId: string) => {
      try {
        await dispatch(withdrawApplication(applicationId)).unwrap();
        dispatch(removeApplicationFromList(applicationId));
        // The thunk automatically dispatches toggleAppliedStatus to internshipSlice
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearApplicationError());
  }, [dispatch]);

  return {
    studentApplications,
    currentApplication,
    isLoading,
    isSubmitting,
    isUpdating,
    error,
    pagination: pagination.student,
    fetchApplications: handleFetchApplications,
    createApplication: handleCreateApplication,
    withdrawApplication: handleWithdrawApplication,
    clearError,
    refetch: () => dispatch(fetchStudentApplications({})),
  };
};

export const useCompanyApplications = (autoFetch = true) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isCompany } = useAuth();

  const {
    companyApplications,
    isLoading,
    isUpdating,
    error,
    pagination,
  } = useSelector((state: RootState) => state.application);

  useEffect(() => {
    if (autoFetch && isAuthenticated && isCompany && !companyApplications.length) {
      dispatch(fetchCompanyApplications({}));
    }
  }, [dispatch, autoFetch, isAuthenticated, isCompany, companyApplications.length]);

  const handleFetchApplications = useCallback(
    async (params?: { page?: number; limit?: number; status?: string }) => {
      try {
        return await dispatch(fetchCompanyApplications(params)).unwrap();
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch]
  );

  const handleUpdateStatus = useCallback(
    async (applicationId: string, status: string) => {
      try {
        const result = await dispatch(updateApplicationStatus({ id: applicationId, status })).unwrap();
        // The result should contain the updated count from the API response
        if (result.applications_count !== undefined) {
          dispatch(updateApplicationsCount({ _id: applicationId, count: result.applications_count }));
        }
        return result;
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearApplicationError());
  }, [dispatch]);

  return {
    companyApplications,
    isLoading,
    isUpdating,
    error,
    pagination: pagination.company,
    fetchApplications: handleFetchApplications,
    updateStatus: handleUpdateStatus,
    clearError,
    refetch: () => dispatch(fetchCompanyApplications({})),
  };
};

export const useApplicationDetail = (id?: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useAuth();

  const {
    currentApplication,
    isLoading,
    isUpdating,
    error,
  } = useSelector((state: RootState) => state.application);

  useEffect(() => {
    if (id && isAuthenticated && (!currentApplication || currentApplication.id !== id)) {
      dispatch(fetchApplicationById(id));
    }
  }, [dispatch, id, isAuthenticated, currentApplication]);

  const handleFetchApplication = useCallback(
    async (applicationId: string) => {
      try {
        return await dispatch(fetchApplicationById(applicationId)).unwrap();
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch]
  );

  const handleUpdateStatus = useCallback(
    async (status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn') => {
      if (!currentApplication) {
        throw new Error('No application loaded');
      }
      try {
        return await dispatch(
          updateApplicationStatus({
            id: currentApplication._id,
            status,
          })
        ).unwrap();
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch, currentApplication]
  );

  const clearError = useCallback(() => {
    dispatch(clearApplicationError());
  }, [dispatch]);

  return {
    application: currentApplication,
    isLoading,
    isUpdating,
    error,
    fetchApplication: handleFetchApplication,
    updateStatus: handleUpdateStatus,
    clearError,
    refetch: () => id && dispatch(fetchApplicationById(id)),
  };
};