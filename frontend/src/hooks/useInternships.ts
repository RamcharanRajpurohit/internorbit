import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  fetchInternships,
  fetchInternshipById,
  fetchCompanyInternships,
  createInternship,
  updateInternship,
  publishInternship,
  deleteInternship,
  setFilters,
  clearFilters,
  toggleSavedStatus,
  toggleAppliedStatus,
  clearInternshipError,
} from '@/store/slices/internshipSlice';
import { saveJob, unsaveJob } from '@/store/slices/savedSlice';
import { useAuth } from './useAuth';

export const useInternships = (autoFetch = true, defaultParams?: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useAuth();

  // Redux state
  const {
    internships,
    currentInternship,
    isLoading,
    isCreating,
    isUpdating,
    error,
    pagination,
    filters,
  } = useSelector((state: RootState) => state.internship);

  // Effects
  useEffect(() => {
    if (autoFetch && isAuthenticated && !internships.length) {
      dispatch(fetchInternships(defaultParams || filters));
    }
  }, [dispatch, autoFetch, isAuthenticated, internships.length, filters, defaultParams]);

  // Actions
  const handleFetchInternships = useCallback(async (newFilters?: typeof filters) => {
    try {
      await dispatch(fetchInternships(newFilters || filters)).unwrap();
    } catch (error: any) {
      throw error;
    }
  }, [dispatch, filters]);

  const handleFetchInternshipById = async (id: string) => {
    try {
      const result = await dispatch(fetchInternshipById(id)).unwrap();
      return result;
    } catch (error: any) {
      throw error;
    }
  };

  const handleCreateInternship = async (internshipData: any) => {
    try {
      const result = await dispatch(createInternship(internshipData)).unwrap();
      return result;
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateInternship = async (id: string, data: any) => {
    try {
      const result = await dispatch(updateInternship({ id, data })).unwrap();
      return result;
    } catch (error: any) {
      throw error;
    }
  };

  const handlePublishInternship = async (id: string) => {
    try {
      await dispatch(publishInternship(id)).unwrap();
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteInternship = async (id: string) => {
    try {
      await dispatch(deleteInternship(id)).unwrap();
    } catch (error: any) {
      throw error;
    }
  };

  const handleSetFilters = (newFilters: typeof filters) => {
    dispatch(setFilters(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const clearError = () => {
    dispatch(clearInternshipError());
  };

  return {
    // State
    internships,
    currentInternship,
    isLoading,
    isCreating,
    isUpdating,
    error,
    pagination,
    filters,

    // Actions
    fetchInternships: handleFetchInternships,
    fetchInternshipById: handleFetchInternshipById,
    createInternship: handleCreateInternship,
    updateInternship: handleUpdateInternship,
    publishInternship: handlePublishInternship,
    deleteInternship: handleDeleteInternship,
    setFilters: handleSetFilters,
    clearFilters: handleClearFilters,
    clearError,
    refetch: () => dispatch(fetchInternships(defaultParams || filters)),
  };
};

export const useCompanyInternships = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isCompany } = useAuth();

  // Redux state
  const {
    companyInternships,
    isLoading,
    isCreating,
    isUpdating,
    error,
  } = useSelector((state: RootState) => state.internship);

  // Effects
  useEffect(() => {
    if (isAuthenticated && isCompany && !companyInternships.length) {
      dispatch(fetchCompanyInternships({}));
    }
  }, [dispatch, isAuthenticated, isCompany, companyInternships.length]);

  // Actions
  const handleFetchCompanyInternships = async (params?: { page?: number; limit?: number }) => {
    try {
      const result = await dispatch(fetchCompanyInternships(params || {})).unwrap();
      return result;
    } catch (error: any) {
      throw error;
    }
  };

  return {
    companyInternships,
    isLoading,
    isCreating,
    isUpdating,
    error,
    refetch: handleFetchCompanyInternships,
  };
};

export const useInternshipActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Use Redux thunks instead of React Query mutations
  const handleSaveJob = async (internshipId: string) => {
    try {
      await dispatch(saveJob(internshipId)).unwrap();
      // Also update the internship list to reflect the saved status
      dispatch(toggleSavedStatus({ _id: internshipId, isSaved: true }));
    } catch (error: any) {
      throw error;
    }
  };

  const handleUnsaveJob = async (internshipId: string) => {
    try {
      await dispatch(unsaveJob(internshipId)).unwrap();
      // Also update the internship list to reflect the unsaved status
      dispatch(toggleSavedStatus({ _id: internshipId, isSaved: false }));
    } catch (error: any) {
      throw error;
    }
  };

  const handleToggleAppliedStatus = (internshipId: string, hasApplied: boolean) => {
    dispatch(toggleAppliedStatus({ _id: internshipId, hasApplied }));
  };

  return {
    saveJob: handleSaveJob,
    unsaveJob: handleUnsaveJob,
    toggleAppliedStatus: handleToggleAppliedStatus,
  };
};

export default useInternships;