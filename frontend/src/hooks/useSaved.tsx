import {
  fetchSavedJobs,
  saveJob,
  unsaveJob,
  createSwipe,
  fetchSwipes,
  clearInteractionError,
  addSavedJobToList,
  removeSavedJobFromList,
} from '@/store/slices/savedSlice';
import { useAuth } from './useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { useEffect, useCallback } from 'react';

export const useSavedJobs = (autoFetch = true, defaultParams?: { page?: number; limit?: number }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isStudent } = useAuth();

  const {
    savedJobs,
    isLoading,
    isSubmitting,
    error,
    hasFetchedSavedJobs,
    pagination,
  } = useSelector((state: RootState) => state.interaction);

  // Only fetch once on initial mount if autoFetch is true
  useEffect(() => {
    if (!autoFetch || !isAuthenticated || !isStudent) return;

    // Only fetch if we haven't already fetched
    if (!hasFetchedSavedJobs) {
      dispatch(fetchSavedJobs(defaultParams || { page: 1, limit: 10 }));
    }
  }, [dispatch, autoFetch, isAuthenticated, isStudent, hasFetchedSavedJobs]);

  const handleFetchSavedJobs = useCallback(
    async (params?: { page?: number; limit?: number }) => {
      try {
        return await dispatch(
          fetchSavedJobs(params || defaultParams || { page: 1, limit: 10 })
        ).unwrap();
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch, defaultParams]
  );

  const handleSaveJob = useCallback(
    async (internshipId: string, internshipData?: any) => {
      try {
        const result = await dispatch(saveJob({ internship_id: internshipId, internshipData })).unwrap();
        console.log('Saved job result:', result);

        // The Redux thunk now handles adding the full internship data
        dispatch(addSavedJobToList(result));
        return { success: true, job: result };
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch]
  );

  const handleUnsaveJob = useCallback(
    async (internshipId: string) => {
      try {
        await dispatch(unsaveJob(internshipId)).unwrap();
        // Thunk handles removing from list automatically
        dispatch(removeSavedJobFromList(internshipId));
        return { success: true };
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearInteractionError());
  }, [dispatch]);

  return {
    savedJobs: Array.isArray(savedJobs) ? savedJobs.filter(job => job !== null && job !== undefined) : [],
    isLoading,
    isSubmitting,
    error,
    pagination: pagination.savedJobs,
    fetchSavedJobs: handleFetchSavedJobs,
    saveJob: handleSaveJob,
    unsaveJob: handleUnsaveJob,
    clearError,
    refetch: () => dispatch(fetchSavedJobs(defaultParams || { page: 1, limit: 10 })),
  };
};

export const useSwipes = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isStudent } = useAuth();

  const {
    swipes,
    isLoading,
    isSubmitting,
    error,
  } = useSelector((state: RootState) => state.interaction);

  const handleCreateSwipe = useCallback(
    async (internshipId: string, direction: 'left' | 'right') => {
      try {
        return await dispatch(
          createSwipe({ internship_id: internshipId, direction })
        ).unwrap();
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch]
  );

  const handleFetchSwipes = useCallback(
    async (params?: { page?: number; limit?: number; direction?: string }) => {
      try {
        return await dispatch(fetchSwipes(params)).unwrap();
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearInteractionError());
  }, [dispatch]);

  return {
    swipes,
    isLoading,
    isSubmitting,
    error,
    createSwipe: handleCreateSwipe,
    fetchSwipes: handleFetchSwipes,
    clearError,
    refetch: () => dispatch(fetchSwipes({})),
  };
};

export default useSavedJobs;