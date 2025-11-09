import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { interactionAPI } from '@/lib/api';
import { extractSavedJob } from '@/lib/dataNormalization';
import type {
  SavedJob,
  SwipeRecord,
  SavedJobsListResponse,
  SaveJobResponse,
  SwipeListResponse,
  PaginationInfo
} from '@/types';

export interface InteractionState {
  savedJobs: SavedJob[];
  swipes: SwipeRecord[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  hasFetchedSavedJobs: boolean;
  pagination: {
    savedJobs: PaginationInfo;
  };
}

// Async thunks
export const fetchSavedJobs = createAsyncThunk(
  'interaction/fetchSavedJobs',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response: SavedJobsListResponse = await interactionAPI.getSavedJobs(params);
      return {
        savedJobs: response.saved || response.savedJobs || [],
        pagination: response.pagination || {
          page: params.page || 1,
          limit: params.limit || 10,
          total: response.total || 0,
          totalPages: response.totalPages || 1,
        },
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch saved jobs');
    }
  }
);

export const saveJob = createAsyncThunk(
  'interaction/saveJob',
  async ({ internship_id, internshipData }: { internship_id: string; internshipData?: any }, { rejectWithValue, dispatch }) => {
    try {
      const response: SaveJobResponse = await interactionAPI.saveJob(internship_id);

      // Dispatch sync to internshipSlice
      dispatch(syncSaveJobToInternshipSlice({
        internshipId: internship_id,
        isSaved: true
      }));

      const normalizedSavedJob = extractSavedJob(response.saved);
      if (!normalizedSavedJob) {
        throw new Error('Invalid saved job response');
      }

      // If internship data is provided, merge it with the saved job response
      if (internshipData) {
        return {
          ...normalizedSavedJob, // Backend response (student_id, _id, saved_at, etc.)
          internship_id: internshipData._id || internship_id,
          internship: internshipData, // Full internship data from dashboard
        };
      }

      return normalizedSavedJob;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save job');
    }
  }
);

export const unsaveJob = createAsyncThunk(
  'interaction/unsaveJob',
  async (internship_id: string, { rejectWithValue, dispatch }) => {
    try {
      await interactionAPI.unsaveJob(internship_id);

      // Dispatch sync to internshipSlice
      dispatch(syncSaveJobToInternshipSlice({
        internshipId: internship_id,
        isSaved: false
      }));

      return internship_id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unsave job');
    }
  }
);

export const createSwipe = createAsyncThunk(
  'interaction/createSwipe',
  async ({ internship_id, direction }: { internship_id: string; direction: 'left' | 'right' }, { rejectWithValue }) => {
    try {
      const response = await interactionAPI.createSwipe(internship_id, direction);
      return response.swipe;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to record swipe');
    }
  }
);

export const fetchSwipes = createAsyncThunk(
  'interaction/fetchSwipes',
  async (params: { page?: number; limit?: number; direction?: string } = {}, { rejectWithValue }) => {
    try {
      const response: SwipeListResponse = await interactionAPI.getSwipes(params);
      return response.swipes || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch swipes');
    }
  }
);

// Initial state
const initialState: InteractionState = {
  savedJobs: [],
  swipes: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  hasFetchedSavedJobs: false,
  pagination: {
    savedJobs: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
  },
};

// Slice
const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAllInteractionData: (state) => {
      state.savedJobs = [];
      state.swipes = [];
      state.hasFetchedSavedJobs = false;
      state.pagination = {
        savedJobs: { page: 1, limit: 10, total: 0, totalPages: 1 },
      };
    },
    resetSavedJobs: (state) => {
      state.savedJobs = [];
      state.hasFetchedSavedJobs = false;
    },
    // FIX: Sync action from other slices - no-op here
    syncSaveJobToInternshipSlice: (state, _action: PayloadAction<{ internshipId: string; isSaved: boolean }>) => {
      // This reducer exists to allow dispatching cross-slice updates
      // The actual update happens in internshipSlice
    },
    // NEW: Manually add saved job to list WITHOUT refetch
    addSavedJobToList: (state, action: PayloadAction<SavedJob>) => {
     console.log('Adding saved job to list:', action);
      console.log('Adding saved job to list:', action.payload);
      const exists = state.savedJobs.some(job =>
        job._id === action.payload._id
      );

      if (!exists) {
        state.savedJobs.unshift(action.payload);
        state.pagination.savedJobs.total += 1;
      }
    },
    // NEW: Manually remove saved job from list WITHOUT refetch
    removeSavedJobFromList: (state, action: PayloadAction<string>) => {
      const initialLength = state.savedJobs.length;
      state.savedJobs = state.savedJobs.filter(job => {
        const jobInternshipId = typeof job.internship_id === 'object'
          ? job.internship_id._id
          : job.internship_id;
        return jobInternshipId !== action.payload && job._id !== action.payload;
      });

      // Update total count
      const removedCount = initialLength - state.savedJobs.length;
      if (removedCount > 0) {
        state.pagination.savedJobs.total = Math.max(0, state.pagination.savedJobs.total - removedCount);
      }
    },
  },

  extraReducers: (builder) => {
    // Fetch saved jobs
    builder
      .addCase(fetchSavedJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSavedJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedJobs = Array.isArray(action.payload.savedJobs) ? action.payload.savedJobs : [];
        state.pagination.savedJobs = action.payload.pagination;
        state.error = null;
        state.hasFetchedSavedJobs = true;
      })
      .addCase(fetchSavedJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Save job
    builder
      .addCase(saveJob.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(saveJob.fulfilled, (state) => {
        state.isSubmitting = false;
        // Now handled via addSavedJobToList action from component
        state.error = null;
      })
      .addCase(saveJob.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Unsave job
    builder
      .addCase(unsaveJob.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(unsaveJob.fulfilled, (state) => {
        state.isSubmitting = false;
        // Now handled via removeSavedJobFromList action from component
        state.error = null;
      })
      .addCase(unsaveJob.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Create swipe
    builder
      .addCase(createSwipe.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createSwipe.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.swipes.unshift(action.payload);
        state.error = null;
      })
      .addCase(createSwipe.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Fetch swipes
    builder
      .addCase(fetchSwipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSwipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.swipes = action.payload;
        state.error = null;
      })
      .addCase(fetchSwipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError: clearInteractionError,
  clearAllInteractionData,
  resetSavedJobs,
  syncSaveJobToInternshipSlice,
  addSavedJobToList,
  removeSavedJobFromList,
} = interactionSlice.actions;

export default interactionSlice.reducer;